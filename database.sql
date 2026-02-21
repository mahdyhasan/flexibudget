CREATE DATABASE flexibudget_ai 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE flexibudget_ai;

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    business_type_id VARCHAR(100),
    business_type_label VARCHAR(255),
    business_category VARCHAR(100),
    has_cogs TINYINT(1) DEFAULT NULL,
    has_bom TINYINT(1) DEFAULT NULL,
    current_step VARCHAR(50) DEFAULT 'select_business',
    onboarding_complete TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit_label VARCHAR(100) DEFAULT 'unit',
    selling_price_per_unit DECIMAL(15,2) DEFAULT 0,
    units_sold_per_month INT DEFAULT 0,
    raw_material_cost DECIMAL(15,2) DEFAULT 0,
    labor_cost_per_unit DECIMAL(15,2) DEFAULT 0,
    packaging_cost_per_unit DECIMAL(15,2) DEFAULT 0,
    other_direct_cost_per_unit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE setup_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15,2) DEFAULT 0,
    amortized_monthly DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE fixed_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount_per_month DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE semi_variable_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    base_amount_per_month DECIMAL(15,2) DEFAULT 0,
    variable_rate_per_unit DECIMAL(15,2) DEFAULT 0,
    unit_reference VARCHAR(255) DEFAULT 'all_products_combined',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE variable_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rate_per_unit DECIMAL(15,2) DEFAULT 0,
    product_reference VARCHAR(255) DEFAULT 'all_products',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE fixed_marketing_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount_per_month DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE variable_marketing_per_unit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    rate_per_unit DECIMAL(15,2) DEFAULT 0,
    product_reference VARCHAR(255) DEFAULT 'all_products',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE variable_marketing_percent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    cost_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    percentage_of_revenue DECIMAL(5,2) DEFAULT 0,
    revenue_reference VARCHAR(255) DEFAULT 'total_revenue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE projection_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL UNIQUE,
    months INT DEFAULT 12,
    amortization_type ENUM('spread_over_projection', 'spread_over_12_months') DEFAULT 'spread_over_projection',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE calculation_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL UNIQUE,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_cogs DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    total_operating_costs DECIMAL(15,2) DEFAULT 0,
    net_pnl DECIMAL(15,2) DEFAULT 0,
    net_margin_percent DECIMAL(5,2) DEFAULT 0,
    breakeven_units INT DEFAULT 0,
    breakeven_revenue DECIMAL(15,2) DEFAULT 0,
    months_to_breakeven INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE monthly_pnl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    result_id INT NOT NULL,
    month_number INT NOT NULL,
    revenue DECIMAL(15,2) DEFAULT 0,
    cogs DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    fixed_costs DECIMAL(15,2) DEFAULT 0,
    semi_variable_costs DECIMAL(15,2) DEFAULT 0,
    variable_costs DECIMAL(15,2) DEFAULT 0,
    marketing_costs DECIMAL(15,2) DEFAULT 0,
    setup_cost_amortized DECIMAL(15,2) DEFAULT 0,
    total_costs DECIMAL(15,2) DEFAULT 0,
    net_pnl DECIMAL(15,2) DEFAULT 0,
    margin_percent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (result_id) REFERENCES calculation_results(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_session ON products(session_id);
CREATE INDEX idx_setup_costs_session ON setup_costs(session_id);
CREATE INDEX idx_fixed_costs_session ON fixed_costs(session_id);
CREATE INDEX idx_semi_variable_costs_session ON semi_variable_costs(session_id);
CREATE INDEX idx_variable_costs_session ON variable_costs(session_id);
CREATE INDEX idx_fixed_marketing_session ON fixed_marketing_costs(session_id);
CREATE INDEX idx_variable_marketing_per_unit_session ON variable_marketing_per_unit(session_id);
CREATE INDEX idx_variable_marketing_percent_session ON variable_marketing_percent(session_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_monthly_pnl_result ON monthly_pnl(result_id);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

