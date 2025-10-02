# Helper Functions
from flask import current_app
from models import db, ItemTag
from PIL import Image
import random

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def resize_image(image_path, max_size=(800, 600)):
    """Resize image to reduce file size while maintaining aspect ratio"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        print(f"Error resizing image: {e}")


def get_existing_tags():
    """Get all unique tags from the database"""
    tags = db.session.query(ItemTag.name).distinct().all()
    return [tag[0] for tag in tags]


def get_hero_messages():
    """Get practical and fun hero messages for the wishlist"""
    return {
        'en': [
            # Practical messages
            "Help friends and family choose the perfect gifts",
            "Curated essentials for your growing family", 
            "Everything we actually need (and want!)",
            "Practical gifts that make parenting easier",
            "From must-haves to nice-to-haves",
            "The things that actually matter",
            "Gifts that grow with your little one",
            "Thoughtfully chosen for new parents",
            "Making gift-giving stress-free for everyone",
            "Real needs, real wants, real help",
            
            # Funny/Cool tips and messages
            "Pro tip: Babies don't actually need 47 stuffed animals",
            "Spoiler alert: Sleep is the best gift (but we'll take diapers too)",
            "Fun fact: Babies grow faster than your ability to buy clothes",
            "Reality check: We need more burp cloths than we think",
            "Insider knowledge: Practical gifts are the real MVPs",
            "Plot twist: The baby will prefer the box over the toy",
            "Life hack: Everything will be covered in mysterious stains",
            "Breaking news: Coffee becomes a food group for parents",
            "Secret: Baby-proofing starts before the baby arrives",
            "Truth bomb: You can never have too many wipes",
            "Wisdom: The simplest toys are often the best",
            "Reality: Babies have zero respect for your sleep schedule"
        ],
        'hu': [
            # Practical messages
            "Segíts a barátoknak és családnak a tökéletes ajándék kiválasztásában",
            "Válogatott alapvető dolgok a növekvő családnak",
            "Minden, amire tényleg szükségünk van (és amit szeretnénk!)",
            "Praktikus ajándékok, amelyek megkönnyítik a szülői létet",
            "A nélkülözhetetlenektől a jó-lenne-ha dolgokig",
            "A dolgok, amelyek tényleg számítanak",
            "Ajándékok, amelyek együtt nőnek a kicsivel",
            "Gondosan kiválasztva új szülőknek",
            "Az ajándékozást stresszmentessé tesszük mindenkinek",
            "Valódi szükségletek, valódi vágyak, valódi segítség",
            
            # Funny/Cool tips and messages
            "Profi tipp: A babáknak tényleg nincs szükségük 47 plüssállatra",
            "Spoiler: Az álom a legjobb ajándék (de a pelenkát is elfogadjuk)",
            "Tény: A babák gyorsabban nőnek, mint ahogy ruhát tudunk venni",
            "Valóság: Több köpőkendőre van szükség, mint gondolnánk",
            "Bennfentes tudás: A praktikus ajándékok a valódi hősök",
            "Plot twist: A baba a dobozt fogja jobban szeretni, mint a játékot",
            "Élethack: Minden rejtélyes foltokkal lesz borítva",
            "Friss hír: A kávé táplálékcsoport lesz a szülőknek",
            "Titok: A bababiztonság a baba érkezése előtt kezdődik",
            "Igazság bomba: Soha nincs elég törlőkendő",
            "Bölcsesség: A legegyszerűbb játékok gyakran a legjobbak",
            "Valóság: A babák nem tisztelik az alvási időbeosztást"
        ]
    }


def get_random_hero_message(language='en'):
    """Get a random hero message for the current language"""
    messages = get_hero_messages()
    return random.choice(messages.get(language, messages['en']))


def get_personalized_texts(language='en'):
    """Get personalized texts using baby name with proper grammar"""
    baby_name = current_app.config['BABY_NAME']
    
    # Use default if baby name is generic
    if baby_name.lower() in ['our little one', 'a kicsi']:
        texts = {
            'page_title': {
                'en': 'Baby Wishlist | Gift Ideas',
                'hu': 'Baba Kívánságlista | Ajándékötletek'
            },
            'welcome_message': {
                'en': 'Welcome to Our Baby Wishlist!',
                'hu': 'Üdvözlünk a Baba Kívánságlistánkon!'
            },
            'admin_title': {
                'en': 'Managing Baby Wishlist',
                'hu': 'Baba Kívánságlista Kezelése'
            },
            'hint_message': {
                'en': "Someone's got a gift for the baby! 🎁",
                'hu': "Valaki ajándékot vesz a babának! 🎁"
            },
            'stats_title': {
                'en': 'Baby Wishlist Stats',
                'hu': 'Baba Kívánságlista Statisztikák'
            }
        }
        
        # Return the texts for the requested language
        return {key: value[language] for key, value in texts.items()}
    else:
        # Use baby name with proper Hungarian grammar structure
        texts = {
            'page_title': {
                'en': f"{baby_name}'s Baby Wishlist | Gift Ideas",
                'hu': f"{baby_name} baba kívánságlistája | Ajándékötletek"
            },
            'welcome_message': {
                'en': f"Welcome to {baby_name}'s Wishlist!",
                'hu': f"Üdvözlünk {baby_name} kívánságlistáján!"
            },
            'admin_title': {
                'en': f"Managing {baby_name}'s Wishlist",
                'hu': f"{baby_name} kívánságlistájának kezelése"
            },
            'hint_message': {
                'en': f"Someone's got a gift for {baby_name}! 🎁",
                'hu': f"Valaki ajándékot vesz {baby_name} babának! 🎁"
            },
            'stats_title': {
                'en': f"{baby_name}'s Wishlist Stats",
                'hu': f"{baby_name} kívánságlistájának statisztikái"
            }
        }
        
        # Return the texts for the requested language
        return {key: value[language] for key, value in texts.items()}


def get_baby_initial():
    """Get the first letter of baby name for favicon"""
    baby_name = current_app.config['BABY_NAME']
    if baby_name.lower() in ['our little one', 'a kicsi']:
        return 'B'  # B for Baby
    return baby_name[0].upper()

