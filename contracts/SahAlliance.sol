// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SahAlliance {
    enum LoanStatus {
        Pending,
        Released
    }

    enum HistoryType {
        Contribution,
        LoanRequested,
        VoteCast,
        LoanReceived,
        Repayment
    }

    struct Circle {
        string name;
        address[] members;
        mapping(address => bool) isMember;
        uint256 potBalance;
        uint256 voteThreshold;
    }

    struct Loan {
        uint256 circleId;
        address borrower;
        uint256 amount;
        string purpose;
        mapping(address => bool) hasVoted;
        uint256 yesVotes;
        uint256 amountRepaid;
        LoanStatus status;
    }

    struct HistoryEntry {
        HistoryType entryType;
        uint256 circleId;
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
    }

    uint256 public circleCount;
    uint256 public loanCount;

    mapping(uint256 => Circle) private circles;
    mapping(uint256 => Loan) private loans;
    mapping(address => HistoryEntry[]) private memberHistory;

    event CircleCreated(uint256 indexed circleId, string name, address[] members, uint256 voteThreshold);
    event Contributed(uint256 indexed circleId, address indexed member, uint256 amount, uint256 potBalance);
    event LoanRequested(uint256 indexed loanId, uint256 indexed circleId, address indexed borrower, uint256 amount, string purpose);
    event VoteCast(uint256 indexed loanId, address indexed voter, bool approve, uint256 yesVotes);
    event LoanReleased(uint256 indexed loanId, uint256 indexed circleId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 amountRepaid);

    modifier onlyCircleMember(uint256 circleId) {
        require(circles[circleId].isMember[msg.sender], "not a circle member");
        _;
    }

    function createCircle(string calldata name, address[] calldata memberAddresses) external returns (uint256 circleId) {
        require(memberAddresses.length >= 2, "circle needs at least 2 members");

        circleId = circleCount++;
        Circle storage c = circles[circleId];
        c.name = name;
        // Majority of members present at creation, fixed once and for all
        // so a loan vote can never stall on a fraction of an unpredictable turnout.
        c.voteThreshold = memberAddresses.length / 2 + 1;

        for (uint256 i = 0; i < memberAddresses.length; i++) {
            address member = memberAddresses[i];
            require(member != address(0), "invalid member address");
            require(!c.isMember[member], "duplicate member");
            c.isMember[member] = true;
            c.members.push(member);
        }

        emit CircleCreated(circleId, name, memberAddresses, c.voteThreshold);
    }

    function contribute(uint256 circleId) external payable onlyCircleMember(circleId) {
        require(msg.value > 0, "contribution must be positive");

        Circle storage c = circles[circleId];
        c.potBalance += msg.value;

        memberHistory[msg.sender].push(
            HistoryEntry(HistoryType.Contribution, circleId, 0, msg.value, block.timestamp)
        );

        emit Contributed(circleId, msg.sender, msg.value, c.potBalance);
    }

    function requestLoan(uint256 circleId, uint256 amount, string calldata purpose)
        external
        onlyCircleMember(circleId)
        returns (uint256 loanId)
    {
        require(amount > 0, "amount must be positive");
        require(amount <= circles[circleId].potBalance, "amount exceeds pot balance");

        loanId = loanCount++;
        Loan storage l = loans[loanId];
        l.circleId = circleId;
        l.borrower = msg.sender;
        l.amount = amount;
        l.purpose = purpose;
        l.status = LoanStatus.Pending;

        memberHistory[msg.sender].push(
            HistoryEntry(HistoryType.LoanRequested, circleId, loanId, amount, block.timestamp)
        );

        emit LoanRequested(loanId, circleId, msg.sender, amount, purpose);
    }

    function voteOnLoan(uint256 loanId, bool approve) external {
        Loan storage l = loans[loanId];
        Circle storage c = circles[l.circleId];
        require(c.isMember[msg.sender], "not a circle member");
        require(l.status == LoanStatus.Pending, "loan already resolved");
        require(!l.hasVoted[msg.sender], "already voted");

        l.hasVoted[msg.sender] = true;
        memberHistory[msg.sender].push(
            HistoryEntry(HistoryType.VoteCast, l.circleId, loanId, 0, block.timestamp)
        );

        if (approve) {
            l.yesVotes++;

            if (l.yesVotes >= c.voteThreshold) {
                l.status = LoanStatus.Released;
                c.potBalance -= l.amount;

                memberHistory[l.borrower].push(
                    HistoryEntry(HistoryType.LoanReceived, l.circleId, loanId, l.amount, block.timestamp)
                );

                emit LoanReleased(loanId, l.circleId, l.borrower, l.amount);

                (bool sent, ) = payable(l.borrower).call{value: l.amount}("");
                require(sent, "transfer to borrower failed");
            }
        }

        emit VoteCast(loanId, msg.sender, approve, l.yesVotes);
    }

    function repayLoan(uint256 loanId) external payable {
        Loan storage l = loans[loanId];
        require(l.status == LoanStatus.Released, "loan not active");
        require(msg.sender == l.borrower, "only borrower can repay");

        uint256 remaining = l.amount - l.amountRepaid;
        require(remaining > 0, "loan already fully repaid");

        // Cap the accepted amount at what's actually owed and refund the rest
        // rather than letting the borrower silently overpay into the pot.
        uint256 accepted = msg.value > remaining ? remaining : msg.value;
        require(accepted > 0, "repayment must be positive");

        l.amountRepaid += accepted;
        circles[l.circleId].potBalance += accepted;

        memberHistory[msg.sender].push(
            HistoryEntry(HistoryType.Repayment, l.circleId, loanId, accepted, block.timestamp)
        );

        emit LoanRepaid(loanId, msg.sender, accepted, l.amountRepaid);

        if (msg.value > accepted) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - accepted}("");
            require(refunded, "overpayment refund failed");
        }
    }

    function getMemberHistory(address member) external view returns (HistoryEntry[] memory) {
        return memberHistory[member];
    }

    function getCircle(uint256 circleId)
        external
        view
        returns (string memory name, uint256 potBalance, uint256 voteThreshold, address[] memory members)
    {
        Circle storage c = circles[circleId];
        return (c.name, c.potBalance, c.voteThreshold, c.members);
    }

    function getLoan(uint256 loanId)
        external
        view
        returns (
            uint256 circleId,
            address borrower,
            uint256 amount,
            string memory purpose,
            uint256 yesVotes,
            uint256 amountRepaid,
            LoanStatus status
        )
    {
        Loan storage l = loans[loanId];
        return (l.circleId, l.borrower, l.amount, l.purpose, l.yesVotes, l.amountRepaid, l.status);
    }

    function hasVotedOnLoan(uint256 loanId, address member) external view returns (bool) {
        return loans[loanId].hasVoted[member];
    }

    function isCircleMember(uint256 circleId, address account) external view returns (bool) {
        return circles[circleId].isMember[account];
    }
}
