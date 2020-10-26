CREATE TABLE device (
	id TEXT PRIMARY KEY,
	user_id TEXT,
	uniqueId TEXT UNIQUE,
	last_asset_sync_time INTEGER,
	authentication_way INTEGER
);

CREATE TABLE user (
	id TEXT PRIMARY KEY,
	user_index INTEGER,
    password_hash TEXT NOT NULL,
	password_salt TEXT NOT NULL,
	score INTEGER,
	backup INTEGER DEFAULT 0,
	mobile TEXT,
	id_card TEXT,
	user_address TEXT,
    passport TEXT,
    email TEXT
);

CREATE TABLE hdw (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	passphrase_hash TEXT NOT NULL,
	passphrase_salt TEXT NOT NULL,
	wallet_name TEXT ,
	mnemonic TEXT NOT NULL,
    seed TEXT NOT NULL
);

CREATE TABLE currency (
	id TEXT PRIMARY KEY,
	network INTEGER NOT NULL,
	currency_type INTEGER NOT NULL,
	currency_name TEXT NOT NULL,
	currency_description TEXT,
	symbol TEXT NOT NULL,
	decimals REAL,
    contract_address TEXT,
    token_type INTEGER,
    total_supply REAL,
    exchange_rate REAL NOT NULL,
	currency_timestamp INTEGER NOT NULL,
	amount REAL
);

CREATE TABLE account (
	id TEXT PRIMARY KEY,
	network INTEGER NOT NULL,
	hdw_id TEXT NOT NULL,
	currency_id TEXT NOT NULL,
	purpose INTEGER NOT NULL,
	coin_type INTEGER NOT NULL,
	currency_type INTEGER NOT NULL,
	curve_type INTEGER NOT NULL,
    account_index INTEGER NOT NULL,
    account_name TEXT NOT NULL,
    account_address TEXT,
    amount String NOT NULL,
    number_of_used_external_key INTEGER NOT NULL,
    number_of_used_internal_key INTEGER NOT NULL,
	last_sync_time INTEGER NOT NULL,
	last_full_sync_time INTEGER NOT NULL,
    account_timestamp INTEGER,
	totalEtherTxCount INTEGER,
	etherInTxCount INTEGER,
	etherOutTxCount INTEGER
);

CREATE TABLE _transaction (
	id TEXT PRIMARY KEY,
    network INTEGER NOT NULL,
	account_id TEXT NOT NULL,
	currency_id TEXT,
	txid TEXT NOT NULL,
    source_addresses TEXT NOT NULL,
    desticnation_addresses TEXT NOT NULL,
	tx_timestamp INTEGER NOT NULL,
	confirmations INTEGER NOT NULL DEFAULT 0,
    amount TEXT NOT NULL,
    gas_price TEXT,
    gas_used INTEGER,
    nonce INTEGER DEFAULT 0,
    block INTEGER DEFAULT 0,
    token_id INTEGER DEFAULT 0,
    block_height INTEGER DEFAULT 0,
	status INTEGER,
	txType INTEGER,
    direction INTEGER,
	locktime INTEGER,
    fee TEXT,
    note BLOB,
    owner_address TEXT,
    owner_contract TEXT,
	confirmed_time INTEGER
);

CREATE TABLE transaction_fee (
	id TEXT PRIMARY KEY,
	network INTEGER NOT NULL,
	currency_id TEXT,
	min TEXT,
	max TEXT,
	average TEXT,
	min_fee_per_byte TEXT,
	average_fee_per_byte TEXT,
	max_fee_per_byte TEXT,
	average_bytes TEXT,
	recommended TEXT,
	slow TEXT,
	standard TEXT,
	fast TEXT,
	gas_limit TEXT,
	slow_fee_per_byte TEXT,
	standard_fee_per_byte TEXT,
	fast_fee_per_byte TEXT,
	unit TEXT,
    transaction_fee_timestamp INTEGER NOT NULL
);

CREATE TABLE utxo (
	id TEXT PRIMARY KEY,
	network INTEGER NOT NULL,
	account_id TEXT NOT NULL,
	currency_id TEXT NOT NULL,
	txid TEXT NOT NULL,
	vout INTEGER NOT NULL,
	utxo_type INTEGER NOT NULL,
    addresses TEXT NOT NULL,
    amount REAL NOT NULL,
	chain_index INTEGER NOT NULL,
    key_index INTEGER NOT NULL, 
    data BLOB NOT NULL, 
    utxo_timestamp INTEGER NOT NULL, 
    locked INTEGER NOT NULL, 
	sequence INTEGER
);