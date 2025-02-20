## Now ##

## Future ##
- The algorithm should avoid giving someone more than 17 shifts a month and more than 9 night duties a month, the 19 requirement is only if absolutely necessary
- maybe instead of random picking, you pick greedily based on who has had the least shift or you make like a score that takes into acount number of shifts,day,night,etc and you do like a probability based sampling on it or do pure greedy
- You can have a bunch of functions that create test cases and use it to see where the model breaks, how long it takes etc
- For the backtracking step maybe evereyone generates an eligible day list, and whoever has the least number of days gets alotted first
- we only repeat if we have to, if there is an option where we go ahead without repeating that is preferred
- run the eligibility list for a shift twice first with 17 and 9 as max if that is empty then try with 19 and 10.
- could make a doctor class maybe?

-- Inserting dummy doctors
INSERT INTO yourapp_doctor (name, email) VALUES
('Dr. John Smith', 'john.smith@example.com'),
('Dr. Alice Johnson', 'alice.johnson@example.com'),
('Dr. Emily Davis', 'emily.davis@example.com'),
('Dr. Michael Brown', 'michael.brown@example.com'),
('Dr. Sarah Wilson', 'sarah.wilson@example.com');
('Dr. William Taylor', 'william.taylor@example.com'),
('Dr. Jessica Martinez', 'jessica.martinez@example.com'),
('Dr. David Anderson', 'david.anderson@example.com');

-- Inserting dummy teams
INSERT INTO yourapp_team (doctor_id, team_id) VALUES
(1, 'team_A'),
(2, 'team_A'),
(3, 'team_A'),
(4, 'team_A'),
(5, 'team_B'),
(6, 'team_B');
(7, 'team_B');
(8, 'team_B');

-- Inserting dummy off requests
INSERT INTO yourapp_offrequest (doctor_id, date) VALUES
(1, 1),
(1, 2),
(2, 5),
(2, 6),
(3, 7),
(4, 10),
(4, 11),
(5, 17);
