-- Pizza Shack Initial Data
-- Populates menu_items table with sample pizza data

INSERT INTO menu_items (name, description, price, category, image_url, ingredients, size_options, available) VALUES
('Margherita Classic', 'Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil', 10.99, 'classic', '/images/margherita.jpg', '["Mozzarella cheese", "Tomato sauce", "Fresh basil", "Olive oil"]', '["Small ($8.99)", "Medium ($10.99)", "Large ($12.99)"]', TRUE),

('Four Cheese Deluxe', 'Rich blend of mozzarella, parmesan, gorgonzola, and ricotta cheeses', 12.99, 'premium', '/images/4-cheese.jpg', '["Mozzarella", "Parmesan", "Gorgonzola", "Ricotta", "Olive oil"]', '["Small ($10.99)", "Medium ($12.99)", "Large ($14.99)"]', TRUE),

('Marinara Special', 'Simple and delicious with tomato sauce, garlic, oregano, and olive oil', 11.49, 'classic', '/images/pizza-marinara.jpg', '["Tomato sauce", "Garlic", "Oregano", "Olive oil", "Sea salt"]', '["Small ($9.49)", "Medium ($11.49)", "Large ($13.49)"]', TRUE),

('Pepperoni Supreme', 'Classic pepperoni pizza with extra cheese and our signature sauce', 13.99, 'meat', '/images/pepperoni.jpg', '["Pepperoni", "Mozzarella cheese", "Tomato sauce", "Italian herbs"]', '["Small ($11.99)", "Medium ($13.99)", "Large ($15.99)"]', TRUE),

('Veggie Garden', 'Fresh vegetables including bell peppers, mushrooms, onions, and olives', 11.99, 'vegetarian', '/images/veggie.jpg', '["Bell peppers", "Mushrooms", "Red onions", "Black olives", "Mozzarella", "Tomato sauce"]', '["Small ($9.99)", "Medium ($11.99)", "Large ($13.99)"]', TRUE)

ON CONFLICT (name) DO NOTHING;