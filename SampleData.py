from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from flask_bcrypt import Bcrypt
import random

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.lawyerhub

# Initialize Bcrypt
bcrypt = Bcrypt()

# First, clear existing data
print("Clearing existing data...")
db.users.delete_many({})
db.reviews.delete_many({})
db.reward_history.delete_many({})

# Static lawyer data with Indian context
static_lawyers = [
    {
        'email': 'rahul.sharma@example.com',
        'name': 'Rahul Sharma',
        'specialty': ['Criminal Law', 'Constitutional Law'],
        'location': {'city': 'Delhi', 'state': 'Delhi'},
        'rating': 4.8,
        'review_count': 156,
        'reward_points': 720,
        'reward_tier': 'platinum',
        'badges': ['Top Rated', 'Client Favorite', 'Perfect Score', 'Experienced Pro'],
    },
    {
        'email': 'priya.patel@example.com',
        'name': 'Priya Patel',
        'specialty': ['Family Law'],
        'location': {'city': 'Mumbai', 'state': 'Maharashtra'},
        'rating': 4.5,
        'review_count': 89,
        'reward_points': 450,
        'reward_tier': 'gold',
        'badges': ['Rising Star', 'Quick Responder'],
    },
    {
        'email': 'vikram.malhotra@example.com',
        'name': 'Vikram Malhotra',
        'specialty': ['Corporate Law', 'Tax Law'],
        'location': {'city': 'Bangalore', 'state': 'Karnataka'},
        'rating': 4.2,
        'review_count': 67,
        'reward_points': 320,
        'reward_tier': 'gold',
        'badges': ['Experienced Pro'],
    },
    {
        'email': 'anjali.reddy@example.com',
        'name': 'Anjali Reddy',
        'specialty': ['Intellectual Property', 'Cyber Law'],
        'location': {'city': 'Hyderabad', 'state': 'Telangana'},
        'rating': 4.0,
        'review_count': 42,
        'reward_points': 210,
        'reward_tier': 'silver',
        'badges': ['Rising Star'],
    },
    {
        'email': 'raj.singh@example.com',
        'name': 'Raj Singh',
        'specialty': ['Real Estate Law'],
        'location': {'city': 'Chandigarh', 'state': 'Punjab'},
        'rating': 3.7,
        'review_count': 28,
        'reward_points': 120,
        'reward_tier': 'standard',
        'badges': [],
    },
    {
        'email': 'neha.gupta@example.com',
        'name': 'Neha Gupta',
        'specialty': ['Immigration Law', 'Employment Law'],
        'location': {'city': 'Pune', 'state': 'Maharashtra'},
        'rating': 4.6,
        'review_count': 95,
        'reward_points': 500,
        'reward_tier': 'gold',
        'badges': ['Client Favorite', 'Quick Responder'],
    },
    {
        'email': 'arun.kumar@example.com',
        'name': 'Arun Kumar',
        'specialty': ['Bankruptcy Law', 'Debt Relief'],
        'location': {'city': 'Chennai', 'state': 'Tamil Nadu'},
        'rating': 4.3,
        'review_count': 75,
        'reward_points': 400,
        'reward_tier': 'gold',
        'badges': ['Experienced Pro'],
    },
    {
        'email': 'sneha.jain@example.com',
        'name': 'Sneha Jain',
        'specialty': ['Personal Injury', 'Medical Malpractice'],
        'location': {'city': 'Kolkata', 'state': 'West Bengal'},
        'rating': 4.4,
        'review_count': 80,
        'reward_points': 420,
        'reward_tier': 'gold',
        'badges': ['Top Rated', 'Rising Star'],
    },
    {
        'email': 'amit.shah@example.com',
        'name': 'Amit Shah',
        'specialty': ['Environmental Law', 'Energy Law'],
        'location': {'city': 'Ahmedabad', 'state': 'Gujarat'},
        'rating': 4.1,
        'review_count': 60,
        'reward_points': 300,
        'reward_tier': 'silver',
        'badges': ['Rising Star'],
    },
    {
        'email': 'kavita.rao@example.com',
        'name': 'Kavita Rao',
        'specialty': ['Entertainment Law', 'Media Law'],
        'location': {'city': 'Mumbai', 'state': 'Maharashtra'},
        'rating': 4.7,
        'review_count': 110,
        'reward_points': 600,
        'reward_tier': 'platinum',
        'badges': ['Top Rated', 'Client Favorite', 'Perfect Score'],
    },
    {
        'email': 'rohit.mehta@example.com',
        'name': 'Rohit Mehta',
        'specialty': ['Tax Law', 'Corporate Law'],
        'location': {'city': 'Bangalore', 'state': 'Karnataka'},
        'rating': 4.0,
        'review_count': 50,
        'reward_points': 250,
        'reward_tier': 'silver',
        'badges': ['Quick Responder'],
    },
    {
        'email': 'pooja.verma@example.com',
        'name': 'Pooja Verma',
        'specialty': ['Family Law', 'Divorce Law'],
        'location': {'city': 'Lucknow', 'state': 'Uttar Pradesh'},
        'rating': 4.2,
        'review_count': 65,
        'reward_points': 330,
        'reward_tier': 'gold',
        'badges': ['Rising Star'],
    },
    {
        'email': 'manish.yadav@example.com',
        'name': 'Manish Yadav',
        'specialty': ['Civil Litigation', 'Property Disputes'],
        'location': {'city': 'Jaipur', 'state': 'Rajasthan'},
        'rating': 3.9,
        'review_count': 40,
        'reward_points': 200,
        'reward_tier': 'silver',
        'badges': [],
    },
    {
        'email': 'divya.singh@example.com',
        'name': 'Divya Singh',
        'specialty': ['Intellectual Property', 'Patent Law'],
        'location': {'city': 'Hyderabad', 'state': 'Telangana'},
        'rating': 4.5,
        'review_count': 90,
        'reward_points': 470,
        'reward_tier': 'gold',
        'badges': ['Client Favorite'],
    },
    {
        'email': 'suresh.kumar@example.com',
        'name': 'Suresh Kumar',
        'specialty': ['Criminal Law', 'Human Rights Law'],
        'location': {'city': 'Chennai', 'state': 'Tamil Nadu'},
        'rating': 4.6,
        'review_count': 100,
        'reward_points': 550,
        'reward_tier': 'platinum',
        'badges': ['Top Rated', 'Experienced Pro'],
    },
    {
        'email': 'ananya.sharma@example.com',
        'name': 'Ananya Sharma',
        'specialty': ['Family Law', 'Child Custody'],
        'location': {'city': 'Delhi', 'state': 'Delhi'},
        'rating': 4.3,
        'review_count': 70,
        'reward_points': 380,
        'reward_tier': 'gold',
        'badges': ['Rising Star'],
    },
    {
        'email': 'vikas.gupta@example.com',
        'name': 'Vikas Gupta',
        'specialty': ['Real Estate Law', 'Property Law'],
        'location': {'city': 'Pune', 'state': 'Maharashtra'},
        'rating': 4.0,
        'review_count': 55,
        'reward_points': 280,
        'reward_tier': 'silver',
        'badges': [],
    },
    {
        'email': 'nisha.agarwal@example.com',
        'name': 'Nisha Agarwal',
        'specialty': ['Corporate Law', 'Mergers & Acquisitions'],
        'location': {'city': 'Mumbai', 'state': 'Maharashtra'},
        'rating': 4.7,
        'review_count': 120,
        'reward_points': 650,
        'reward_tier': 'platinum',
        'badges': ['Top Rated', 'Client Favorite'],
    },
    {
        'email': 'rajeev.mishra@example.com',
        'name': 'Rajeev Mishra',
        'specialty': ['Tax Law', 'International Tax'],
        'location': {'city': 'Bangalore', 'state': 'Karnataka'},
        'rating': 4.4,
        'review_count': 85,
        'reward_points': 440,
        'reward_tier': 'gold',
        'badges': ['Experienced Pro'],
    },
    {
        'email': 'meera.desai@example.com',
        'name': 'Meera Desai',
        'specialty': ['Immigration Law', 'Visa Services'],
        'location': {'city': 'Ahmedabad', 'state': 'Gujarat'},
        'rating': 4.1,
        'review_count': 60,
        'reward_points': 310,
        'reward_tier': 'silver',
        'badges': ['Rising Star'],
    }
]

universities = [
    'National Law School of India University, Bangalore', 
    'NALSAR University of Law, Hyderabad',
    'National Law University, Delhi', 
    'Government Law College, Mumbai',
    'Faculty of Law, Delhi University'
]

law_firms = [
    'Amarchand & Mangaldas',
    'AZB & Partners',
    'Khaitan & Co',
    'Luthra & Luthra Law Offices',
    'Cyril Amarchand Mangaldas'
]

# Process and insert lawyers
lawyers = []
for lawyer_data in static_lawyers:
    # Hash password with Bcrypt
    hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
    
    # Complete the lawyer object with additional fields
    lawyer = {
        'email': lawyer_data['email'],
        'password': hashed_password,
        'name': lawyer_data['name'],
        'role': 'lawyer',
        'specialty': lawyer_data['specialty'],
        'location': {
            'city': lawyer_data['location']['city'],
            'state': lawyer_data['location']['state'],
            'address': f"123, Lawyer Colony, {lawyer_data['location']['city']}"
        },
        'bio': f"Experienced advocate specializing in {' and '.join(lawyer_data['specialty'])} with 10+ years of practice in {lawyer_data['location']['city']}.",
        'education': [
            {
                'institution': universities[static_lawyers.index(lawyer_data) % len(universities)],
                'degree': 'LL.B',
                'year': 2010
            }
        ],
        'experience': [
            {
                'company': law_firms[static_lawyers.index(lawyer_data) % len(law_firms)],
                'position': 'Senior Advocate',
                'years': '2015 - Present'
            }
        ],
        'license_info': {
            'license_number': f"BAR{lawyer_data['location']['state'][:3].upper()}{10000 + static_lawyers.index(lawyer_data)}",
            'state': lawyer_data['location']['state'],
            'year_admitted': 2012
        },
        'profile_complete': True,
        'is_verified': True,
        'rating': lawyer_data['rating'],
        'review_count': lawyer_data['review_count'],
        'badges': lawyer_data['badges'],
        'reward_points': lawyer_data['reward_points'],
        'reward_tier': lawyer_data['reward_tier'],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    lawyers.append(lawyer)

# Insert lawyers into database
result = db.users.insert_many(lawyers)
print(f"Successfully inserted {len(result.inserted_ids)} lawyers")

# Create static review data
review_comments = [
    "Very professional and knowledgeable in the subject matter. Would highly recommend.",
    "Excellent legal advice and representation. Helped me win my case.",
    "Prompt responses and clear communication throughout the process.",
    "Provided practical solutions to complex legal issues.",
    "Very satisfied with the service. Worth every rupee spent."
]

reviews = []
for i, lawyer in enumerate(lawyers):
    num_reviews = min(lawyer['review_count'], 5)  # Limit to 5 sample reviews per lawyer
    for j in range(num_reviews):
        client_id = ObjectId()
        review = {
            'user_id': str(client_id),
            'reviewer_name': f"Client {i*5 + j + 1}",
            'lawyer_id': str(lawyer['_id']),
            'rating': min(5, max(3, round(lawyer['rating'] + random.uniform(-0.5, 0.5)))),
            'comment': review_comments[j % len(review_comments)],
            'created_at': datetime.utcnow()
        }
        reviews.append(review)

# Insert reviews
if reviews:
    db.reviews.insert_many(reviews)
    print(f"Successfully inserted {len(reviews)} reviews")

# Create reward history entries
history_entries = []
for lawyer in lawyers:
    lawyer_id = str(lawyer['_id'])
    current_tier = lawyer.get('reward_tier', 'standard')
    current_badges = lawyer.get('badges', [])
    
    # Create tier change entry if not standard
    if current_tier != 'standard':
        previous_tiers = ['standard', 'silver', 'gold']
        
        # Determine previous tier based on current tier
        if current_tier == 'platinum':
            previous_tier = 'gold'
        elif current_tier == 'gold':
            previous_tier = 'silver'
        else:
            previous_tier = 'standard'
            
        history_entries.append({
            'lawyer_id': lawyer_id,
            'event_type': 'tier_change',
            'description': f'Promoted from {previous_tier} to {current_tier} tier',
            'previous_tier': previous_tier,
            'new_tier': current_tier,
            'points': lawyer.get('reward_points', 0),
            'created_at': datetime.utcnow()
        })
    
    # Create badge entries
    for badge in current_badges:
        history_entries.append({
            'lawyer_id': lawyer_id,
            'event_type': 'badge_earned',
            'description': f'Earned the "{badge}" badge',
            'badge_earned': badge,
            'created_at': datetime.utcnow()
        })
    
    # Add review activities
    if lawyer.get('review_count', 0) > 0:
        # Add the most recent review activity
        rating = int(lawyer['rating'])
        history_entries.append({
            'lawyer_id': lawyer_id,
            'event_type': 'review',
            'description': f'Received a {rating}-star review',
            'rating': rating,
            'created_at': datetime.utcnow()
        })

# Insert reward history entries
if history_entries:
    db.reward_history.insert_many(history_entries)
    print(f"Successfully inserted {len(history_entries)} reward history entries")

# Create a client user for testing
client_user = {
    'email': 'client@example.com',
    'password': bcrypt.generate_password_hash('password123').decode('utf-8'),
    'name': 'Test Client',
    'role': 'client',
    'created_at': datetime.utcnow(),
    'updated_at': datetime.utcnow()
}
db.users.insert_one(client_user)
print("Created test client user")

# Create an admin user
admin_user = {
    'email': 'admin@lawyerhub.com',
    'password': bcrypt.generate_password_hash('admin123').decode('utf-8'),
    'name': 'System Administrator',
    'role': 'admin',
    'created_at': datetime.utcnow(),
    'updated_at': datetime.utcnow()
}
db.users.insert_one(admin_user)
print("Created admin user")

print("\n----- Test Users Information -----")
print("LAWYERS:")
for lawyer in static_lawyers:
    print(f"  - Email: {lawyer['email']}")
    print(f"    Name: {lawyer['name']}") 
    print(f"    Tier: {lawyer['reward_tier']}")
    print(f"    Password: password123")
    print()

print("CLIENT:")
print("  - Email: client@example.com")
print("  - Password: password123")
print()

print("ADMIN:")
print("  - Email: admin@lawyerhub.com")
print("  - Password: admin123")
print()

print("Sample data with static credentials has been successfully added to the database!")