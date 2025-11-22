// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CrimeTrace - PoliceCitizen Connect registry
/// @notice Minimal contract to support role checks and citizen registration for the Crime Trace dApp.
contract CrimeTrace {
    struct Citizen {
        address wallet;
        string aliasName;
        string idType;
        bytes32 idHash;
        string metadata; // JSON string with city/state/pincode/IPFS CID etc.
        bool exists;
        bool active;
        uint256 registeredAt;
    }

    struct Station {
        uint256 id;
        string name;
        address wallet;
        bool active;
        string place;
        string code; // human-friendly unique identifier provided by admin
        uint256 registeredAt;
    }

    enum SubmissionStatus {
        Pending,
        Accepted,
        Rejected
    }

    struct CaseRecord {
        uint256 id;
        address stationWallet;
        string category;
        string crimeSpot;
        string description;
        string metadata; // JSON string with IPFS CIDs, map data, etc.
        bool open;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Submission {
        uint256 id;
        uint256 caseId;
        address citizen;
        string description;
        string location;
        string metadata; // JSON string, e.g. IPFS CIDs and extra context
        SubmissionStatus status;
        uint256 rewardPoints;
        uint256 createdAt;
        uint256 reviewedAt;
    }

    address public platformAdmin;
    uint256 public nextStationId = 1;
    uint256 public nextCaseId = 1;
    uint256 public nextSubmissionId = 1;

    mapping(address => Citizen) private citizens;
    mapping(address => Station) private stations;
    address[] private stationWallets;
    address[] private citizenWallets;

    // Case and submission storage
    mapping(uint256 => CaseRecord) private cases;
    uint256[] private caseIds;
    mapping(address => uint256[]) private stationCases;

    mapping(uint256 => Submission) private submissions;
    uint256[] private submissionIds;
    mapping(uint256 => uint256[]) private caseSubmissions;
    mapping(address => uint256[]) private citizenSubmissions;

    mapping(address => uint256) public citizenPoints;

    event CitizenRegistered(address indexed wallet, string aliasName, string idType, bytes32 idHash, string metadata);
    event CitizenRevoked(address indexed wallet, string reason);
    event StationRegistered(uint256 indexed id, address indexed wallet, string name, string place, string code);
    event StationUpdated(uint256 indexed id, address indexed wallet, string name, string place, string code);
    event StationStatusUpdated(uint256 indexed id, address indexed wallet, bool active);

    event CaseRegistered(
        uint256 indexed id,
        address indexed stationWallet,
        string category,
        string crimeSpot,
        string metadata
    );
    event CaseStatusUpdated(uint256 indexed id, bool open);

    event CitizenInfoSubmitted(
        uint256 indexed id,
        uint256 indexed caseId,
        address indexed citizen,
        string metadata
    );

    event SubmissionReviewed(uint256 indexed id, uint8 status, uint256 rewardPoints);

    event CitizenRewarded(address indexed citizen, uint256 indexed submissionId, uint256 points, uint256 totalPoints);

    modifier onlyAdmin() {
        require(msg.sender == platformAdmin, "Only platform admin");
        _;
    }

    constructor() {
        platformAdmin = msg.sender;
    }

    // --- Role checks ---

    function isPlatformAdmin(address user) external view returns (bool) {
        return user == platformAdmin;
    }

    function isCitizen(address user) external view returns (bool) {
        Citizen storage c = citizens[user];
        return c.exists && c.active;
    }

    function isRegisteredStation(address user) external view returns (bool) {
        return stations[user].active;
    }

    function isRegisteredStation(address user, uint256 stationId) external view returns (bool) {
        Station storage s = stations[user];
        return s.active && s.id == stationId;
    }

    function getStationByWallet(address user)
        external
        view
        returns (
            uint256 id,
            string memory name,
            address wallet,
            bool active,
            string memory place,
            string memory code,
            uint256 registeredAt
        )
    {
        Station storage s = stations[user];
        require(s.wallet != address(0), "Station not found");
        return (s.id, s.name, s.wallet, s.active, s.place, s.code, s.registeredAt);
    }

    function getStationWallets() external view returns (address[] memory) {
        return stationWallets;
    }

    function getCitizenWallets() external view returns (address[] memory) {
        return citizenWallets;
    }

    function getStationCount() external view returns (uint256) {
        return stationWallets.length;
    }

    function getCitizenCount() external view returns (uint256) {
        return citizenWallets.length;
    }

    function getActiveStationCount() external view returns (uint256) {
        uint256 count;
        for (uint256 i = 0; i < stationWallets.length; i++) {
            if (stations[stationWallets[i]].active) {
                count++;
            }
        }
        return count;
    }

    function getActiveCitizenCount() external view returns (uint256) {
        uint256 count;
        for (uint256 i = 0; i < citizenWallets.length; i++) {
            Citizen storage c = citizens[citizenWallets[i]];
            if (c.exists && c.active) {
                count++;
            }
        }
        return count;
    }

    function getCitizenByWallet(address user)
        external
        view
        returns (
            address wallet,
            string memory aliasName,
            string memory idType,
            bool active,
            string memory metadata,
            uint256 registeredAt
        )
    {
        Citizen storage c = citizens[user];
        require(c.exists, "Citizen not found");
        return (c.wallet, c.aliasName, c.idType, c.active, c.metadata, c.registeredAt);
    }

    // --- Admin station management ---

    function registerStation(
        address stationWallet,
        string calldata name,
        string calldata place,
        string calldata code
    ) external onlyAdmin returns (uint256) {
        require(stationWallet != address(0), "Invalid wallet");
        require(stations[stationWallet].wallet == address(0), "Station already exists");

        uint256 assignedId = nextStationId++;
        stations[stationWallet] = Station({
            id: assignedId,
            name: name,
            wallet: stationWallet,
            active: true,
            place: place,
            code: code,
            registeredAt: block.timestamp
        });
        stationWallets.push(stationWallet);

        emit StationRegistered(assignedId, stationWallet, name, place, code);
        return assignedId;
    }

    function setStationStatus(address stationWallet, bool active) external onlyAdmin {
        Station storage s = stations[stationWallet];
        require(s.wallet != address(0), "Station not found");
        s.active = active;
        emit StationStatusUpdated(s.id, stationWallet, active);
    }

    function updateStation(
        address stationWallet,
        string calldata name,
        string calldata place,
        string calldata code
    ) external onlyAdmin {
        Station storage s = stations[stationWallet];
        require(s.wallet != address(0), "Station not found");
        s.name = name;
        s.place = place;
        s.code = code;
        emit StationUpdated(s.id, stationWallet, name, place, code);
    }

    // --- Citizen registration ---

    function registerCitizen(
        string calldata aliasName,
        string calldata idType,
        bytes32 idHash,
        string calldata metadata
    ) external {
        require(!citizens[msg.sender].exists, "Citizen already registered");
        require(bytes(idType).length > 0, "ID type required");
        require(idHash != bytes32(0), "ID hash required");

        citizens[msg.sender] = Citizen({
            wallet: msg.sender,
            aliasName: aliasName,
            idType: idType,
            idHash: idHash,
            metadata: metadata,
            exists: true,
            active: true,
            registeredAt: block.timestamp
        });

        citizenWallets.push(msg.sender);

        emit CitizenRegistered(msg.sender, aliasName, idType, idHash, metadata);
    }

    function revokeCitizen(address citizenWallet, string calldata reason) external onlyAdmin {
        Citizen storage c = citizens[citizenWallet];
        require(c.exists, "Citizen not found");
        require(c.active, "Citizen already revoked");
        c.active = false;
        emit CitizenRevoked(citizenWallet, reason);
    }

    // --- Case management ---

    function registerCase(
        string calldata category,
        string calldata crimeSpot,
        string calldata description,
        string calldata metadata
    ) external returns (uint256) {
        Station storage s = stations[msg.sender];
        require(s.wallet != address(0) && s.active, "Only active station");

        uint256 caseId = nextCaseId++;

        cases[caseId] = CaseRecord({
            id: caseId,
            stationWallet: msg.sender,
            category: category,
            crimeSpot: crimeSpot,
            description: description,
            metadata: metadata,
            open: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        caseIds.push(caseId);
        stationCases[msg.sender].push(caseId);

        emit CaseRegistered(caseId, msg.sender, category, crimeSpot, metadata);
        return caseId;
    }

    function updateCaseStatus(uint256 caseId, bool open) external {
        CaseRecord storage c = cases[caseId];
        require(c.id != 0, "Case not found");

        bool isAdmin = msg.sender == platformAdmin;
        if (!isAdmin) {
            Station storage s = stations[msg.sender];
            require(s.wallet != address(0) && s.active, "Only active station");
            require(c.stationWallet == msg.sender, "Not case owner");
        }

        c.open = open;
        c.updatedAt = block.timestamp;
        emit CaseStatusUpdated(caseId, open);
    }

    function getCase(uint256 caseId)
        external
        view
        returns (
            uint256 id,
            address stationWallet,
            string memory category,
            string memory crimeSpot,
            string memory description,
            string memory metadata,
            bool open,
            uint256 createdAt,
            uint256 updatedAt
        )
    {
        CaseRecord storage c = cases[caseId];
        require(c.id != 0, "Case not found");
        return (
            c.id,
            c.stationWallet,
            c.category,
            c.crimeSpot,
            c.description,
            c.metadata,
            c.open,
            c.createdAt,
            c.updatedAt
        );
    }

    function getCasesByStation(address stationWallet) external view returns (uint256[] memory) {
        return stationCases[stationWallet];
    }

    function getAllCaseIds() external view returns (uint256[] memory) {
        return caseIds;
    }

    function getStationCaseStats(address stationWallet)
        external
        view
        returns (uint256 total, uint256 openCount, uint256 closedCount, uint256 last7dCount)
    {
        uint256[] storage ids = stationCases[stationWallet];
        total = ids.length;

        uint256 cutoff = block.timestamp > 7 days ? block.timestamp - 7 days : 0;

        for (uint256 i = 0; i < ids.length; i++) {
            CaseRecord storage c = cases[ids[i]];
            if (c.open) {
                openCount++;
            } else {
                closedCount++;
            }

            if (c.createdAt >= cutoff) {
                last7dCount++;
            }
        }
    }

    // --- Citizen submissions & rewards ---

    function submitCitizenInfo(
        uint256 caseId,
        string calldata description,
        string calldata location,
        string calldata metadata
    ) external returns (uint256) {
        Citizen storage ctz = citizens[msg.sender];
        require(ctz.exists && ctz.active, "Only active citizen");

        CaseRecord storage cr = cases[caseId];
        require(cr.id != 0, "Case not found");

        uint256 submissionId = nextSubmissionId++;

        submissions[submissionId] = Submission({
            id: submissionId,
            caseId: caseId,
            citizen: msg.sender,
            description: description,
            location: location,
            metadata: metadata,
            status: SubmissionStatus.Pending,
            rewardPoints: 0,
            createdAt: block.timestamp,
            reviewedAt: 0
        });

        submissionIds.push(submissionId);
        caseSubmissions[caseId].push(submissionId);
        citizenSubmissions[msg.sender].push(submissionId);

        emit CitizenInfoSubmitted(submissionId, caseId, msg.sender, metadata);
        return submissionId;
    }

    function reviewSubmission(
        uint256 submissionId,
        SubmissionStatus newStatus,
        uint256 rewardPoints
    ) external {
        Submission storage s = submissions[submissionId];
        require(s.id != 0, "Submission not found");

        CaseRecord storage cr = cases[s.caseId];
        require(cr.id != 0, "Case not found");

        bool isAdmin = msg.sender == platformAdmin;
        if (!isAdmin) {
            Station storage st = stations[msg.sender];
            require(st.wallet != address(0) && st.active, "Only active station");
            require(cr.stationWallet == msg.sender, "Not case station");
        }

        require(s.status == SubmissionStatus.Pending, "Already reviewed");
        require(
            newStatus == SubmissionStatus.Accepted || newStatus == SubmissionStatus.Rejected,
            "Invalid status"
        );

        s.status = newStatus;
        s.rewardPoints = rewardPoints;
        s.reviewedAt = block.timestamp;

        emit SubmissionReviewed(submissionId, uint8(newStatus), rewardPoints);

        if (rewardPoints > 0) {
            citizenPoints[s.citizen] += rewardPoints;
            emit CitizenRewarded(s.citizen, submissionId, rewardPoints, citizenPoints[s.citizen]);
        }
    }

    function getSubmission(uint256 submissionId)
        external
        view
        returns (
            uint256 id,
            uint256 caseId,
            address citizen,
            string memory description,
            string memory location,
            string memory metadata,
            SubmissionStatus status,
            uint256 rewardPoints,
            uint256 createdAt,
            uint256 reviewedAt
        )
    {
        Submission storage s = submissions[submissionId];
        require(s.id != 0, "Submission not found");
        return (
            s.id,
            s.caseId,
            s.citizen,
            s.description,
            s.location,
            s.metadata,
            s.status,
            s.rewardPoints,
            s.createdAt,
            s.reviewedAt
        );
    }

    function getSubmissionsByCase(uint256 caseId) external view returns (uint256[] memory) {
        return caseSubmissions[caseId];
    }

    function getSubmissionsByCitizen(address citizen) external view returns (uint256[] memory) {
        return citizenSubmissions[citizen];
    }

    function getAllSubmissionIds() external view returns (uint256[] memory) {
        return submissionIds;
    }
}
