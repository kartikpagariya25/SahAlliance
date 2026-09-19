// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SahAlliance {
    enum LoanStatus { Open, Released, Repaid }

    struct Loan {
        uint256 id;
        uint256 circleId;
        address borrower;
        uint256 amount;
        string purpose;
        uint256 yesVotes;
        uint256 amountRepaid;
        LoanStatus status;
        uint256 createdAt;
    }

    struct Circle {
        uint256 id;
        string name;
        address[] members;
        uint256 potBalance;
    }

    enum EventType { Contribution, LoanRequested, Vote, LoanReleased, Repayment }

    struct HistoryEntry {
        EventType eventType;
        uint256 circleId;
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
    }

    uint256 public circleCount;
    uint256 public loanCount;

    mapping(uint256 => Circle) public circles;
    mapping(uint256 => mapping(address => bool)) public isMember;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => HistoryEntry[]) private memberHistory;

    event CircleCreated(uint256 indexed circleId, string name, address[] members);
    event Contributed(uint256 indexed circleId, address indexed member, uint256 amount, uint256 timestamp);
    event LoanRequested(uint256 indexed loanId, uint256 indexed circleId, address indexed borrower, uint256 amount, string purpose);
    event Voted(uint256 indexed loanId, address indexed voter, bool approve, uint256 yesVotes);
    event LoanReleased(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event Repaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 amountRepaid);

    modifier onlyMember(uint256 circleId) {
        require(isMember[circleId][msg.sender], "not a circle member");
        _;
    }

    function createCircle(string calldata name, address[] calldata memberAddresses) external returns (uint256) {
        require(memberAddresses.length >= 2, "need at least 2 members");

        circleCount++;
        uint256 circleId = circleCount;

        Circle storage c = circles[circleId];
        c.id = circleId;
        c.name = name;
        c.members = memberAddresses;

        for (uint256 i = 0; i < memberAddresses.length; i++) {
            isMember[circleId][memberAddresses[i]] = true;
        }

        emit CircleCreated(circleId, name, memberAddresses);
        return circleId;
    }

    function contribute(uint256 circleId) external payable onlyMember(circleId) {
        require(msg.value > 0, "contribution must be > 0");

        circles[circleId].potBalance += msg.value;

        memberHistory[msg.sender].push(HistoryEntry({
            eventType: EventType.Contribution,
            circleId: circleId,
            loanId: 0,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit Contributed(circleId, msg.sender, msg.value, block.timestamp);
    }

    function requestLoan(uint256 circleId, uint256 amount, string calldata purpose) external onlyMember(circleId) returns (uint256) {
        require(amount > 0, "amount must be > 0");
        require(amount <= circles[circleId].potBalance, "exceeds pot balance");

        loanCount++;
        uint256 loanId = loanCount;

        loans[loanId] = Loan({
            id: loanId,
            circleId: circleId,
            borrower: msg.sender,
            amount: amount,
            purpose: purpose,
            yesVotes: 0,
            amountRepaid: 0,
            status: LoanStatus.Open,
            createdAt: block.timestamp
        });

        memberHistory[msg.sender].push(HistoryEntry({
            eventType: EventType.LoanRequested,
            circleId: circleId,
            loanId: loanId,
            amount: amount,
            timestamp: block.timestamp
        }));

        emit LoanRequested(loanId, circleId, msg.sender, amount, purpose);
        return loanId;
    }

    function voteOnLoan(uint256 loanId, bool approve) external {
        Loan storage loan = loans[loanId];
        require(loan.id != 0, "loan does not exist");
        require(loan.status == LoanStatus.Open, "loan already resolved");
        require(isMember[loan.circleId][msg.sender], "not a circle member");
        require(!hasVoted[loanId][msg.sender], "already voted");

        hasVoted[loanId][msg.sender] = true;

        memberHistory[msg.sender].push(HistoryEntry({
            eventType: EventType.Vote,
            circleId: loan.circleId,
            loanId: loanId,
            amount: approve ? 1 : 0,
            timestamp: block.timestamp
        }));

        if (approve) {
            loan.yesVotes++;
        }

        emit Voted(loanId, msg.sender, approve, loan.yesVotes);

        uint256 threshold = (circles[loan.circleId].members.length / 2) + 1;
        if (loan.yesVotes >= threshold) {
            loan.status = LoanStatus.Released;
            circles[loan.circleId].potBalance -= loan.amount;

            memberHistory[loan.borrower].push(HistoryEntry({
                eventType: EventType.LoanReleased,
                circleId: loan.circleId,
                loanId: loanId,
                amount: loan.amount,
                timestamp: block.timestamp
            }));

            payable(loan.borrower).transfer(loan.amount);
            emit LoanReleased(loanId, loan.borrower, loan.amount);
        }
    }

    function repayLoan(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        require(loan.id != 0, "loan does not exist");
        require(loan.status == LoanStatus.Released || loan.status == LoanStatus.Repaid, "loan not released yet");
        require(msg.value > 0, "repayment must be > 0");
        require(loan.amountRepaid < loan.amount, "loan already fully repaid");

        loan.amountRepaid += msg.value;
        circles[loan.circleId].potBalance += msg.value;

        if (loan.amountRepaid >= loan.amount) {
            loan.status = LoanStatus.Repaid;
        }

        memberHistory[msg.sender].push(HistoryEntry({
            eventType: EventType.Repayment,
            circleId: loan.circleId,
            loanId: loanId,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit Repaid(loanId, msg.sender, msg.value, loan.amountRepaid);
    }

    function getMemberHistory(address member) external view returns (HistoryEntry[] memory) {
        return memberHistory[member];
    }

    function getCircleMembers(uint256 circleId) external view returns (address[] memory) {
        return circles[circleId].members;
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
}
