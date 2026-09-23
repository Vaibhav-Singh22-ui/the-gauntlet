import json

questions = []

def add(qid, level, color, cat, text, opt_a, opt_b, opt_c, opt_d, correct, hint, sec=55):
    opts = [str(opt_a).strip(), str(opt_b).strip(), str(opt_c).strip(), str(opt_d).strip()]
    assert len(set(opts)) == 4, f"Options not unique for {qid}: {opts}"
    assert correct in ['A', 'B', 'C', 'D'], f"Invalid correct option {correct}"
    questions.append({
        "external_id": qid,
        "question_text": text.strip(),
        "option_a": opts[0],
        "option_b": opts[1],
        "option_c": opts[2],
        "option_d": opts[3],
        "correct_option": correct,
        "hint_text": hint.strip(),
        "level": level,
        "color": color,
        "category": cat,
        "difficulty": "HARD",
        "expected_solve_seconds": sec,
        "verification_status": "VERIFIED",
        "active": True,
        "source_type": "HIGH_DIFFICULTY_MASTER_BANK",
        "source_reference": f"Level {level} {color} Expert Tier"
    })

# ==============================================================================
# LEVEL 4 (60 questions: 10 per color)
# ==============================================================================
# RED
add("HD-L04-RED-01", 4, "RED", "Number Theory", "What is the remainder when 2^50 is divided by 7?", "1", "2", "4", "5", "C", "2^3 = 8 = 1 (mod 7). 50 = 3*16 + 2, so 2^2 = 4.")
add("HD-L04-RED-02", 4, "RED", "Number Theory", "What are the last two digits of 3^40?", "01", "21", "81", "41", "A", "3^4 = 81. 81^10 mod 100 = 1 + 80*10 = 01.")
add("HD-L04-RED-03", 4, "RED", "Number Theory", "What is the sum of all distinct prime factors of 1001?", "28", "31", "33", "35", "B", "1001 = 7 * 11 * 13. Sum = 31.")
add("HD-L04-RED-04", 4, "RED", "Number Theory", "How many total positive divisors does 360 have?", "18", "20", "24", "28", "C", "360 = 2^3 * 3^2 * 5^1. (3+1)(2+1)(1+1) = 24.")
add("HD-L04-RED-05", 4, "RED", "Number Theory", "How many trailing zeros are at the end of 60!?", "12", "14", "15", "16", "B", "60/5 + 60/25 = 12 + 2 = 14.")
add("HD-L04-RED-06", 4, "RED", "Number Theory", "What is the remainder when 5^99 is divided by 13?", "5", "8", "11", "12", "B", "By Fermat, 5^12 = 1 mod 13. 99 = 12*8 + 3. 5^3 = 125 = 8 mod 13.")
add("HD-L04-RED-07", 4, "RED", "Number Theory", "What is the greatest common divisor of 2024 and 748?", "22", "44", "66", "88", "B", "Euclidean algorithm yields GCD = 44.")
add("HD-L04-RED-08", 4, "RED", "Number Theory", "What is the smallest positive integer with exactly 12 positive divisors?", "60", "72", "84", "96", "A", "60 = 2^2 * 3 * 5 has 3*2*2 = 12 divisors.")
add("HD-L04-RED-09", 4, "RED", "Number Theory", "What is the decimal equivalent of the octal number 753 (base 8)?", "475", "491", "503", "521", "B", "7*64 + 5*8 + 3 = 491.")
add("HD-L04-RED-10", 4, "RED", "Number Theory", "If the 5-digit number 37x52 is divisible by 9, what is digit x?", "1", "3", "5", "7", "A", "3+7+x+5+2 = 17+x = 18 -> x = 1.")

# BLUE
add("HD-L04-BLUE-01", 4, "BLUE", "Probability", "Two fair 6-sided dice are rolled. What is the probability that the sum is at least 9?", "1/4", "5/18", "1/3", "7/18", "B", "10 outcomes out of 36 give sum >= 9. 10/36 = 5/18.")
add("HD-L04-BLUE-02", 4, "BLUE", "Probability", "Two cards are drawn without replacement from a 52-card deck. Probability both are Aces?", "1/221", "1/169", "4/663", "1/204", "A", "(4/52)*(3/51) = 1/221.")
add("HD-L04-BLUE-03", 4, "BLUE", "Combinatorics", "In how many distinct ways can the letters of 'SUCCESS' be arranged?", "420", "560", "840", "1260", "A", "7! / (3! * 2!) = 5040 / 12 = 420.")
add("HD-L04-BLUE-04", 4, "BLUE", "Combinatorics", "From 7 men and 5 women, how many committees of 3 men and 2 women can be formed?", "250", "300", "350", "400", "C", "C(7,3) * C(5,2) = 35 * 10 = 350.")
add("HD-L04-BLUE-05", 4, "BLUE", "Probability", "A fair coin is tossed 4 times. What is the probability of getting at least one head?", "7/8", "15/16", "3/4", "31/32", "B", "1 - (1/2)^4 = 15/16.")
add("HD-L04-BLUE-06", 4, "BLUE", "Combinatorics", "If 15 delegates shake hands with each other exactly once, how many handshakes occur?", "90", "105", "120", "135", "B", "15*14/2 = 105.")
add("HD-L04-BLUE-07", 4, "BLUE", "Probability", "A bag has 4 red and 6 black balls. Two are drawn simultaneously. Probability both have same color?", "7/15", "1/3", "2/5", "8/15", "A", "(C(4,2)+C(6,2))/C(10,2) = (6+15)/45 = 21/45 = 7/15.")
add("HD-L04-BLUE-08", 4, "BLUE", "Combinatorics", "In how many ways can 6 people sit around a circular table?", "120", "240", "720", "60", "A", "(6-1)! = 5! = 120.")
add("HD-L04-BLUE-09", 4, "BLUE", "Probability", "A pair of dice is rolled. Given the sum is 8, what is the probability at least one die is 3?", "1/5", "2/5", "3/5", "1/4", "B", "Sums to 8: (2,6),(3,5),(4,4),(5,3),(6,2). Two have a 3 -> 2/5.")
add("HD-L04-BLUE-10", 4, "BLUE", "Combinatorics", "In how many ways can the letters of 'DETAIL' be arranged so vowels occupy only odd positions?", "24", "36", "72", "144", "B", "3! * 3! = 36.")

# GREEN
add("HD-L04-GREEN-01", 4, "GREEN", "Geometry", "Legs of a right triangle are 9 cm and 12 cm. What is the altitude to the hypotenuse?", "6.4 cm", "7.2 cm", "7.5 cm", "8.0 cm", "B", "Hypotenuse = 15. Altitude = 9*12/15 = 7.2 cm.")
add("HD-L04-GREEN-02", 4, "GREEN", "Mensuration", "A cone and cylinder share the same base and height. What is the ratio of their volumes?", "1:2", "1:3", "2:3", "3:4", "B", "Volume of cone is 1/3 of cylinder.")
add("HD-L04-GREEN-03", 4, "GREEN", "Geometry", "How many diagonals does a regular nonagon (9 sides) have?", "24", "27", "30", "36", "B", "9*6/2 = 27.")
add("HD-L04-GREEN-04", 4, "GREEN", "Geometry", "A circle is inscribed in a square of side 14 cm. Area outside circle but inside square? (pi=22/7)", "36 cm²", "42 cm²", "48 cm²", "56 cm²", "B", "196 - 154 = 42 cm².")
add("HD-L04-GREEN-05", 4, "GREEN", "Geometry", "Parallel sides of a trapezoid are 16 cm and 24 cm, area is 200 cm². Distance between them?", "8 cm", "10 cm", "12 cm", "15 cm", "B", "200 = 0.5*(16+24)*h -> h = 10 cm.")
add("HD-L04-GREEN-06", 4, "GREEN", "Mensuration", "If surface area of a sphere is 616 cm², what is its radius? (pi=22/7)", "6 cm", "7 cm", "8 cm", "9 cm", "B", "4*(22/7)*r^2 = 616 -> r = 7 cm.")
add("HD-L04-GREEN-07", 4, "GREEN", "Geometry", "What is the interior angle of a regular octagon?", "120°", "135°", "140°", "144°", "B", "(8-2)*180/8 = 135°.")
add("HD-L04-GREEN-08", 4, "GREEN", "Geometry", "A chord of length 16 cm is 6 cm from circle center. What is circle radius?", "8 cm", "9 cm", "10 cm", "12 cm", "C", "sqrt(6^2 + 8^2) = 10 cm.")
add("HD-L04-GREEN-09", 4, "GREEN", "Mensuration", "If space diagonal of a cube is 6*sqrt(3) cm, what is its total surface area?", "144 cm²", "180 cm²", "216 cm²", "256 cm²", "C", "Side a = 6. Surface area = 6*36 = 216 cm².")
add("HD-L04-GREEN-10", 4, "GREEN", "Geometry", "Diagonals of a rhombus are 18 cm and 24 cm. What is the length of its side?", "12 cm", "15 cm", "16 cm", "20 cm", "B", "sqrt(9^2 + 12^2) = 15 cm.")

# YELLOW
add("HD-L04-YELLOW-01", 4, "YELLOW", "Algebra", "If alpha, beta are roots of 2x^2 - 7x + 3 = 0, what is alpha^2 + beta^2?", "37/4", "41/4", "45/4", "49/4", "A", "(7/2)^2 - 2(3/2) = 49/4 - 6 = 37/4.")
add("HD-L04-YELLOW-02", 4, "YELLOW", "Algebra", "In an AP, the 4th term is 14 and 12th term is 70. What is the first term?", "-9", "-7", "-5", "-3", "B", "8d = 56 -> d = 7. a = 14 - 21 = -7.")
add("HD-L04-YELLOW-03", 4, "YELLOW", "Algebra", "In a GP, 3rd term is 12 and 6th term is 96. What is the 8th term?", "192", "288", "384", "512", "C", "r = 2, a = 3. a_8 = 3 * 2^7 = 384.")
add("HD-L04-YELLOW-04", 4, "YELLOW", "Algebra", "If 3x + 2y = 26 and 2x + 3y = 29, what is x - y?", "-5", "-3", "3", "5", "B", "(3x+2y) - (2x+3y) = 26 - 29 -> x - y = -3.")
add("HD-L04-YELLOW-05", 4, "YELLOW", "Algebra", "What is log_2(32) + log_3(81) - log_5(125)?", "4", "5", "6", "7", "C", "5 + 4 - 3 = 6.")
add("HD-L04-YELLOW-06", 4, "YELLOW", "Algebra", "If x + y = 8 and xy = 15, what is x^3 + y^3?", "152", "168", "184", "216", "A", "8^3 - 3*15*8 = 512 - 360 = 152.")
add("HD-L04-YELLOW-07", 4, "YELLOW", "Algebra", "How many real solutions exist for |2x - 5| = 3x - 10?", "0", "1", "2", "3", "B", "Only x = 5 satisfies condition 3x - 10 >= 0 and equation.")
add("HD-L04-YELLOW-08", 4, "YELLOW", "Algebra", "What is the remainder when P(x) = 2x^3 - 5x^2 + 4x - 7 is divided by (x - 2)?", "-3", "-1", "1", "3", "A", "P(2) = 16 - 20 + 8 - 7 = -3.")
add("HD-L04-YELLOW-09", 4, "YELLOW", "Algebra", "What is the solution set of (x - 2)(x - 6) < 0?", "x < 2", "2 < x < 6", "x > 6", "x <= 2", "B", "Product is negative between roots 2 and 6.")
add("HD-L04-YELLOW-10", 4, "YELLOW", "Algebra", "If 9^(x+1) = 27^(x-1), what is x?", "3", "4", "5", "6", "C", "3^(2x+2) = 3^(3x-3) -> 2x+2 = 3x-3 -> x = 5.")

# PINK
add("HD-L04-PINK-01", 4, "PINK", "Logical Reasoning", "A person walks 10 m South, turns left, walks 24 m, then turns left again and walks 10 m. Distance from start?", "14 m", "24 m", "26 m", "34 m", "B", "Vertical offsets cancel; horizontal is 24 m.")
add("HD-L04-PINK-02", 4, "PINK", "Logical Reasoning", "Pointing to a man, a woman says: 'His mother's only son is my father.' How is she related to the man?", "Daughter", "Sister", "Mother", "Niece", "A", "The man is her father, so she is his daughter.")
add("HD-L04-PINK-03", 4, "PINK", "Logical Reasoning", "Statements: All cats are dogs. No dog is a bird. Conclusion I: No cat is bird. Conclusion II: Some dogs are cats.", "Only I", "Only II", "Both I and II", "Neither", "C", "Both valid categorical syllogisms.")
add("HD-L04-PINK-04", 4, "PINK", "Logical Reasoning", "Five friends A, B, C, D, E sit in a circle facing center. B is between A and D. E is left of A. Who is right of D?", "A", "B", "C", "E", "B", "Adjacent counter-clockwise to D is B.")
add("HD-L04-PINK-05", 4, "PINK", "Logical Reasoning", "Find the next term: 3, 10, 29, 66, 127, ?", "198", "218", "225", "242", "B", "n^3 + 2 -> 6^3 + 2 = 218.")
add("HD-L04-PINK-06", 4, "PINK", "Logical Reasoning", "If Jan 1 of a non-leap year was a Monday, what day was Dec 31 of that year?", "Sunday", "Monday", "Tuesday", "Wednesday", "B", "Non-leap year has 365 days = 52 weeks + 1 day; ends on same day.")
add("HD-L04-PINK-07", 4, "PINK", "Logical Reasoning", "What is the angle between hour and minute hand of a clock at 3:40?", "120°", "130°", "140°", "150°", "B", "|30*3 - 5.5*40| = |90 - 220| = 130°.")
add("HD-L04-PINK-08", 4, "PINK", "Logical Reasoning", "If A=1, B=2, ..., what is the sum of letter positions for PRISM?", "71", "73", "75", "77", "C", "16 + 18 + 9 + 19 + 13 = 75.")
add("HD-L04-PINK-09", 4, "PINK", "Logical Reasoning", "Out of 50 students, 30 play football, 25 play cricket, 10 play both. How many play neither?", "5", "10", "15", "20", "A", "50 - (30+25-10) = 5.")
add("HD-L04-PINK-10", 4, "PINK", "Logical Reasoning", "A 4cm cube painted on all faces is cut into 1cm cubes. How many have exactly 2 faces painted?", "16", "24", "32", "48", "B", "12 * (4 - 2) = 24.")

# VIOLET
add("HD-L04-VIOLET-01", 4, "VIOLET", "Time & Distance", "Two trains 140m and 160m long run toward each other at 40 km/h and 50 km/h. Seconds to cross?", "10 s", "12 s", "14 s", "16 s", "B", "300m / 25 m/s = 12 s.")
add("HD-L04-VIOLET-02", 4, "VIOLET", "Time & Work", "A finishes work in 12 days, B in 15 days. They work 4 days, then A leaves. Days for B to finish?", "4 days", "5 days", "6 days", "7 days", "C", "(2/5) / (1/15) = 6 days.")
add("HD-L04-VIOLET-03", 4, "VIOLET", "Commercial Math", "₹10,000 invested at 10% compound interest annually for 3 years. Total interest?", "₹3,000", "₹3,100", "₹3,310", "₹3,641", "C", "10000 * (1.331 - 1) = 3310.")
add("HD-L04-VIOLET-04", 4, "VIOLET", "Commercial Math", "Selling an article for ₹720 causes 10% loss. Price to sell to gain 15%?", "₹880", "₹900", "₹920", "₹950", "C", "CP = 800. SP = 800 * 1.15 = 920.")
add("HD-L04-VIOLET-05", 4, "VIOLET", "Time & Work", "Pipe A fills in 8 hours, Pipe B empties in 12 hours. Hours to fill empty tank together?", "18 h", "20 h", "24 h", "30 h", "C", "1/8 - 1/12 = 1/24 -> 24 hours.")
add("HD-L04-VIOLET-06", 4, "VIOLET", "Time & Distance", "Boat travels 24 km downstream in 2h and 16 km upstream in 2h. Speed of stream?", "1 km/h", "2 km/h", "3 km/h", "4 km/h", "B", "(12 - 8)/2 = 2 km/h.")
add("HD-L04-VIOLET-07", 4, "VIOLET", "Commercial Math", "Ratio of tea at ₹62/kg to tea at ₹72/kg to create mixture worth ₹65/kg?", "7:3", "5:2", "3:2", "4:3", "A", "(72-65):(65-62) = 7:3.")
add("HD-L04-VIOLET-08", 4, "VIOLET", "Time & Distance", "Car goes City A to B at 60 km/h and returns at 40 km/h. Average speed?", "48 km/h", "50 km/h", "52 km/h", "54 km/h", "A", "2*60*40/100 = 48 km/h.")
add("HD-L04-VIOLET-09", 4, "VIOLET", "Commercial Math", "A and B invest in ratio 3:5. 10% goes to charity, A receives ₹810. Total profit?", "₹2,400", "₹2,500", "₹2,700", "₹3,000", "A", "810 * (8/3) / 0.9 = 2400.")
add("HD-L04-VIOLET-10", 4, "VIOLET", "Commercial Math", "Single discount equivalent to successive discounts of 20%, 15%, and 10%?", "38.8%", "41.2%", "42.0%", "45.0%", "A", "1 - 0.8*0.85*0.9 = 38.8%.")

print(f"Generated Level 4: 60 questions. Total: {len(questions)}")
