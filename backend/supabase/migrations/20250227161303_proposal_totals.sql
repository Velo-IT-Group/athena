CREATE OR REPLACE VIEW proposal_totals AS
WITH phase_totals AS (
    SELECT 
        ph.version,
        SUM(ph.hours) AS total_hours
    FROM phases ph
    GROUP BY ph.version
),
product_totals AS (
    SELECT 
        pr.version,

        -- Non-recurring totals
        SUM(CASE 
            WHEN pr.recurring_flag = false AND pr.parent IS NULL 
            THEN 
                CASE 
                    WHEN pr.product_class = 'Bundle' THEN pr.calculated_price
                    ELSE pr.extended_price
                END
            ELSE 0
        END) AS non_recurring_total,

        SUM(CASE 
            WHEN pr.recurring_flag = false AND pr.parent IS NULL 
            THEN 
                CASE 
                    WHEN pr.product_class = 'Bundle' THEN pr.calculated_cost
                    ELSE pr.extended_cost
                END
            ELSE 0
        END) AS non_recurring_cost,

        -- Recurring totals
        SUM(CASE 
            WHEN pr.recurring_flag = true AND pr.parent IS NULL 
            THEN 
                CASE 
                    WHEN pr.product_class = 'Bundle' THEN pr.calculated_price
                    ELSE pr.extended_price
                END
            ELSE 0
        END) AS recurring_total,

        SUM(CASE 
            WHEN pr.recurring_flag = true AND pr.parent IS NULL 
            THEN 
                CASE 
                    WHEN pr.product_class = 'Bundle' THEN pr.calculated_cost
                    ELSE pr.extended_cost
                END
            ELSE 0
        END) AS recurring_cost

    FROM products pr
    WHERE pr.parent IS NULL  -- Exclude child products early
    GROUP BY pr.version
)
SELECT 
    p.id AS proposal_id,
    v.id AS version_id,
    v.number AS version_number,

    -- Labor cost
    COALESCE(pt.total_hours, 0) AS total_hours,
    p.labor_rate,
    COALESCE(pt.total_hours, 0) * p.labor_rate AS labor_cost,

    -- Non-recurring product totals
    COALESCE(ptot.non_recurring_total, 0) AS non_recurring_product_total,
    COALESCE(ptot.non_recurring_cost, 0) AS non_recurring_product_cost,

    -- Recurring product totals
    COALESCE(ptot.recurring_total, 0) AS recurring_total,
    COALESCE(ptot.recurring_cost, 0) AS recurring_cost,

    -- Total price (non-recurring + recurring + labor)
    COALESCE(ptot.non_recurring_total, 0) + 
    COALESCE(ptot.recurring_total, 0) + 
    (COALESCE(pt.total_hours, 0) * p.labor_rate) AS total_price

FROM 
    proposals p
JOIN 
    versions v ON v.proposal = p.id
    AND v.id = p.working_version  -- Only fetch the working version
LEFT JOIN 
    phase_totals pt ON pt.version = v.id
LEFT JOIN 
    product_totals ptot ON ptot.version = v.id;