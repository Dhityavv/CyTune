export interface TriviaQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_QUESTION_BANK: TriviaQuestion[] = [
  {
    "id": "ez_001",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Who is known as the 'King of Pop' and released the best-selling album 'Thriller'?",
    "options": [
      "Prince",
      "Michael Jackson",
      "Stevie Wonder",
      "George Michael"
    ],
    "correctIndex": 1,
    "explanation": "Michael Jackson released 'Thriller' in 1982, becoming the best-selling album in music history with over 70 million copies sold."
  },
  {
    "id": "ez_002",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which Canadian artist released the viral synth-pop single 'Blinding Lights' in 2020?",
    "options": [
      "Drake",
      "The Weeknd",
      "Justin Bieber",
      "Shawn Mendes"
    ],
    "correctIndex": 1,
    "explanation": "The Weeknd released 'Blinding Lights' on his album 'After Hours', spending a record 90 weeks on the Billboard Hot 100."
  },
  {
    "id": "ez_003",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Which British rock band sang 'Bohemian Rhapsody' and was fronted by Freddie Mercury?",
    "options": [
      "Led Zeppelin",
      "Queen",
      "The Who",
      "The Rolling Stones"
    ],
    "correctIndex": 1,
    "explanation": "Queen released 'Bohemian Rhapsody' in 1975 on their 'A Night at the Opera' album."
  },
  {
    "id": "ez_004",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Which four-member band from Liverpool was known as 'The Fab Four'?",
    "options": [
      "The Kinks",
      "The Beatles",
      "The Clash",
      "The Police"
    ],
    "correctIndex": 1,
    "explanation": "The Beatles (John, Paul, George, and Ringo) earned the moniker 'The Fab Four' during 1960s Beatlemania."
  },
  {
    "id": "ez_005",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian singer-songwriter gained widespread acclaim in 2024 with the melancholic track 'Satu Bulan'?",
    "options": [
      "NIKI",
      "Bernadya",
      "Mahalini",
      "Tiara Andini"
    ],
    "correctIndex": 1,
    "explanation": "Bernadya captured massive viral acclaim across Southeast Asia with her emotive album and the song 'Satu Bulan'."
  },
  {
    "id": "ez_006",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Jakarta-born singer signed with 88rising and produced hit singles like 'lowkey' and 'Vintage'?",
    "options": [
      "Stephanie Poetri",
      "NIKI",
      "Isyana Sarasvati",
      "Raisa"
    ],
    "correctIndex": 1,
    "explanation": "NIKI (Nicole Zefanya) broke through internationally with 88rising before headlining global tours and Coachella."
  },
  {
    "id": "ez_007",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "How many strings does a standard acoustic or electric guitar have?",
    "options": [
      "4",
      "5",
      "6",
      "8"
    ],
    "correctIndex": 2,
    "explanation": "Standard acoustic and electric guitars have 6 strings, tuned to E-A-D-G-B-E."
  },
  {
    "id": "ez_008",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "How many keys are on a standard full-size modern acoustic piano?",
    "options": [
      "76",
      "84",
      "88",
      "92"
    ],
    "correctIndex": 2,
    "explanation": "A standard modern piano has 88 keys: 52 white keys (natural notes) and 36 black keys (accidentals)."
  },
  {
    "id": "ez_009",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which superstar singer's fan community is officially known as the 'Swifties'?",
    "options": [
      "Ariana Grande",
      "Taylor Swift",
      "Beyoncé",
      "Billie Eilish"
    ],
    "correctIndex": 1,
    "explanation": "Taylor Swift's millions of dedicated fans across the world are globally known as 'Swifties'."
  },
  {
    "id": "ez_010",
    "category": "Hip-Hop & R&B",
    "difficulty": "Easy",
    "question": "Which rapper and producer founded the record label 'OVO Sound' and hails from Toronto?",
    "options": [
      "Travis Scott",
      "Kendrick Lamar",
      "Drake",
      "J. Cole"
    ],
    "correctIndex": 2,
    "explanation": "Drake (Aubrey Graham) founded OVO Sound (October's Very Own) in Toronto, Canada."
  },
  {
    "id": "ez_011",
    "category": "Electronic & Dance",
    "difficulty": "Easy",
    "question": "Which French electronic music duo was famous for performing in robot helmets before parting ways in 2021?",
    "options": [
      "Justice",
      "Daft Punk",
      "Air",
      "Modjo"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk (Thomas Bangalter and Guy-Manuel de Homem-Christo) revolutionized electronic dance music in signature robot personas."
  },
  {
    "id": "ez_012",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which British singer swept the Grammys with her hit ballad 'Rolling in the Deep' from the album '21'?",
    "options": [
      "Dua Lipa",
      "Adele",
      "Ellie Goulding",
      "Jessie J"
    ],
    "correctIndex": 1,
    "explanation": "Adele released 'Rolling in the Deep' as the lead single from her diamond-certified 2011 album '21'."
  },
  {
    "id": "ez_013",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which pop singer wrote and sang the dance-pop hit 'Bad Romance'?",
    "options": [
      "Katy Perry",
      "Lady Gaga",
      "Rihanna",
      "Britney Spears"
    ],
    "correctIndex": 1,
    "explanation": "Lady Gaga released 'Bad Romance' on 'The Fame Monster' in 2009, winning two Grammy Awards."
  },
  {
    "id": "ez_014",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Who was the legendary guitarist famous for playing the electric guitar upside-down and with his teeth at Woodstock?",
    "options": [
      "Eric Clapton",
      "Jimi Hendrix",
      "Jimmy Page",
      "Keith Richards"
    ],
    "correctIndex": 1,
    "explanation": "Jimi Hendrix revolutionized electric guitar playing with fuzz pedals, feedback, and electrifying stage antics."
  },
  {
    "id": "ez_015",
    "category": "Classical & Orchestral",
    "difficulty": "Easy",
    "question": "Which composer wrote 'Fur Elise' and continued to compose his monumental 9th Symphony after going deaf?",
    "options": [
      "Wolfgang Amadeus Mozart",
      "Ludwig van Beethoven",
      "Johann Sebastian Bach",
      "Frederic Chopin"
    ],
    "correctIndex": 1,
    "explanation": "Ludwig van Beethoven composed his iconic Ninth Symphony while experiencing profound deafness."
  },
  {
    "id": "ez_016",
    "category": "Classical & Orchestral",
    "difficulty": "Easy",
    "question": "Which Austrian musical prodigy composed symphonies at age five and wrote the opera 'The Magic Flute'?",
    "options": [
      "Franz Schubert",
      "Wolfgang Amadeus Mozart",
      "Johannes Brahms",
      "Joseph Haydn"
    ],
    "correctIndex": 1,
    "explanation": "Wolfgang Amadeus Mozart showed extraordinary keyboard and violin talent from early childhood in Salzburg."
  },
  {
    "id": "ez_017",
    "category": "Hip-Hop & R&B",
    "difficulty": "Easy",
    "question": "Which American rapper released the critically praised albums 'good kid, m.A.A.d city' and 'To Pimp a Butterfly'?",
    "options": [
      "Kanye West",
      "Kendrick Lamar",
      "Eminem",
      "A$AP Rocky"
    ],
    "correctIndex": 1,
    "explanation": "Compton rapper Kendrick Lamar earned widespread acclaim and the Pulitzer Prize for Music with his catalog."
  },
  {
    "id": "ez_018",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which brass instrument uses a sliding mechanism to alter its pitch rather than valves?",
    "options": [
      "Trumpet",
      "Trombone",
      "French Horn",
      "Tuba"
    ],
    "correctIndex": 1,
    "explanation": "The trombone uses a telescoping slide to change the length of its tubing and modify pitch."
  },
  {
    "id": "ez_019",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What musical term indicates that a piece should be played very softly?",
    "options": [
      "Forte",
      "Piano",
      "Allegro",
      "Crescendo"
    ],
    "correctIndex": 1,
    "explanation": "'Piano' (abbreviated 'p') is the Italian dynamic marking instructing the performer to play softly."
  },
  {
    "id": "ez_020",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What symbol at the beginning of a musical staff is commonly used for higher-pitched instruments and female vocals?",
    "options": [
      "Bass Clef",
      "Treble Clef",
      "Alto Clef",
      "Neutral Clef"
    ],
    "correctIndex": 1,
    "explanation": "The Treble Clef (or G Clef) is used for notes above middle C on the musical staff."
  },
  {
    "id": "ez_021",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which British artist holds one of the most streamed songs in Spotify history with 'Shape of You'?",
    "options": [
      "Sam Smith",
      "Ed Sheeran",
      "Lewis Capaldi",
      "George Ezra"
    ],
    "correctIndex": 1,
    "explanation": "Ed Sheeran released 'Shape of You' in 2017 as the lead single from 'Divide'."
  },
  {
    "id": "ez_022",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which teenage prodigy swept the Big Four Grammys in 2020 with her debut album 'When We All Fall Asleep, Where Do We Go?'?",
    "options": [
      "Olivia Rodrigo",
      "Billie Eilish",
      "Lorde",
      "Sabrina Carpenter"
    ],
    "correctIndex": 1,
    "explanation": "Billie Eilish and her brother Finneas produced the multi-Grammy-winning album in their home bedroom studio."
  },
  {
    "id": "ez_023",
    "category": "Hip-Hop & R&B",
    "difficulty": "Easy",
    "question": "Which hip-hop legend won an Academy Award for Best Original Song with 'Lose Yourself' from the movie '8 Mile'?",
    "options": [
      "50 Cent",
      "Eminem",
      "Snoop Dogg",
      "Jay-Z"
    ],
    "correctIndex": 1,
    "explanation": "Eminem became the first hip-hop artist to win an Oscar for Best Original Song in 2003."
  },
  {
    "id": "ez_024",
    "category": "Music Genres",
    "difficulty": "Easy",
    "question": "Which Jamaican icon is globally revered as the pioneer of Reggae and recorded 'No Woman, No Cry'?",
    "options": [
      "Peter Tosh",
      "Bob Marley",
      "Jimmy Cliff",
      "Toots Hibbert"
    ],
    "correctIndex": 1,
    "explanation": "Bob Marley and the Wailers introduced reggae and Rastafari culture to worldwide audiences."
  },
  {
    "id": "ez_025",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Who was widely crowned as the 'King of Rock and Roll' in the 1950s?",
    "options": [
      "Buddy Holly",
      "Elvis Presley",
      "Jerry Lee Lewis",
      "Chuck Berry"
    ],
    "correctIndex": 1,
    "explanation": "Elvis Presley exploded into global superstardom with Sun Records and RCA hits like 'Heartbreak Hotel'."
  },
  {
    "id": "ez_026",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Which grunge band fronted by Kurt Cobain released the landmark 1991 album 'Nevermind'?",
    "options": [
      "Pearl Jam",
      "Nirvana",
      "Soundgarden",
      "Alice in Chains"
    ],
    "correctIndex": 1,
    "explanation": "Nirvana's 'Smells Like Teen Spirit' catalyzed the grunge alternative rock explosion in early 1990s Seattle."
  },
  {
    "id": "ez_027",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which British band fronted by Chris Martin released anthemic hits like 'Yellow', 'Fix You', and 'Viva La Vida'?",
    "options": [
      "Muse",
      "Coldplay",
      "Keane",
      "Snow Patrol"
    ],
    "correctIndex": 1,
    "explanation": "Coldplay achieved global stadium rock status starting with their debut album 'Parachutes' in 2000."
  },
  {
    "id": "ez_028",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which former Destiny's Child lead singer is known to fans as 'Queen Bey'?",
    "options": [
      "Kelly Rowland",
      "Beyonce",
      "Ciara",
      "Rihanna"
    ],
    "correctIndex": 1,
    "explanation": "Beyonce Knowles-Carter holds the record for the most Grammy wins by any artist in history."
  },
  {
    "id": "ez_029",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which multi-talented artist teamed up with Mark Ronson on the funk smash 'Uptown Funk'?",
    "options": [
      "Pharrell Williams",
      "Bruno Mars",
      "Robin Thicke",
      "Justin Timberlake"
    ],
    "correctIndex": 1,
    "explanation": "Bruno Mars sang and co-wrote the chart-topping throwback funk track 'Uptown Funk' in 2014."
  },
  {
    "id": "ez_030",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which Barbadian singer scored her first global Billboard Hot 100 #1 with 'Umbrella' in 2007?",
    "options": [
      "Beyonce",
      "Rihanna",
      "Nicki Minaj",
      "Rita Ora"
    ],
    "correctIndex": 1,
    "explanation": "Rihanna's 'Umbrella' featuring Jay-Z cemented her superstar transition with 'Good Girl Gone Bad'."
  },
  {
    "id": "ez_031",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Which legendary band recorded the iconic 1977 soft-rock album 'Rumours' amidst intense band breakups?",
    "options": [
      "The Eagles",
      "Fleetwood Mac",
      "Heart",
      "ABBA"
    ],
    "correctIndex": 1,
    "explanation": "Fleetwood Mac's 'Rumours' spawned classic hits like 'Dreams' and 'Go Your Own Way'."
  },
  {
    "id": "ez_032",
    "category": "Rock & Legends",
    "difficulty": "Easy",
    "question": "Which Australian hard rock band released the tribute album 'Back in Black' in 1980?",
    "options": [
      "Iron Maiden",
      "AC/DC",
      "Judas Priest",
      "Black Sabbath"
    ],
    "correctIndex": 1,
    "explanation": "AC/DC recorded 'Back in Black' with new frontman Brian Johnson following the passing of Bon Scott."
  },
  {
    "id": "ez_033",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which Swedish pop group won Eurovision in 1974 with 'Waterloo' and topped charts with 'Dancing Queen'?",
    "options": [
      "A-ha",
      "ABBA",
      "Roxette",
      "Ace of Base"
    ],
    "correctIndex": 1,
    "explanation": "ABBA remains one of the most successful pop groups in history, consisting of Agnetha, Bjorn, Benny, and Anni-Frid."
  },
  {
    "id": "ez_034",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which Canadian singer was discovered on YouTube by Scooter Braun and released the 2010 smash 'Baby'?",
    "options": [
      "Shawn Mendes",
      "Justin Bieber",
      "Zayn Malik",
      "Austin Mahone"
    ],
    "correctIndex": 1,
    "explanation": "Justin Bieber grew from a viral YouTube teen performer into one of the best-selling music artists of all time."
  },
  {
    "id": "ez_035",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which vocalist famous for her four-octave range and whistle notes released the 2019 album 'Thank U, Next'?",
    "options": [
      "Camila Cabello",
      "Ariana Grande",
      "Demi Lovato",
      "Selena Gomez"
    ],
    "correctIndex": 1,
    "explanation": "Ariana Grande broke multiple streaming records in 2019 with 'Thank U, Next' and '7 rings'."
  },
  {
    "id": "ez_036",
    "category": "Hip-Hop & R&B",
    "difficulty": "Easy",
    "question": "Which American artist blended melodic rap, rock, and pop in hits like 'Rockstar' and 'Circles'?",
    "options": [
      "Lil Nas X",
      "Post Malone",
      "Juice WRLD",
      "The Kid LAROI"
    ],
    "correctIndex": 1,
    "explanation": "Post Malone achieved diamond-certified status with multiple tracks across 'Beerbongs & Bentleys' and 'Hollywood's Bleeding'."
  },
  {
    "id": "ez_037",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which British-Albanian singer brought disco nostalgia to the 2020s with her album 'Future Nostalgia'?",
    "options": [
      "Rita Ora",
      "Dua Lipa",
      "Charli XCX",
      "Anne-Marie"
    ],
    "correctIndex": 1,
    "explanation": "Dua Lipa's 'Future Nostalgia' claimed the Grammy for Best Pop Vocal Album in 2021."
  },
  {
    "id": "ez_038",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which singer-songwriter broke global debut streaming records in January 2021 with 'drivers license'?",
    "options": [
      "Sabrina Carpenter",
      "Olivia Rodrigo",
      "Gracie Abrams",
      "Conan Gray"
    ],
    "correctIndex": 1,
    "explanation": "Olivia Rodrigo's debut single 'drivers license' spent eight weeks at number one on the Billboard Hot 100."
  },
  {
    "id": "ez_039",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which former One Direction member topped global charts for 15 weeks in 2022 with the synth-pop song 'As It Was'?",
    "options": [
      "Zayn Malik",
      "Harry Styles",
      "Niall Horan",
      "Liam Payne"
    ],
    "correctIndex": 1,
    "explanation": "Harry Styles won Album of the Year at the 2023 Grammys for 'Harry's House'."
  },
  {
    "id": "ez_040",
    "category": "Pop & Charts",
    "difficulty": "Easy",
    "question": "Which pop-rock band fronted by Adam Levine released their breakthrough debut album 'Songs About Jane'?",
    "options": [
      "OneRepublic",
      "Maroon 5",
      "The Fray",
      "Train"
    ],
    "correctIndex": 1,
    "explanation": "Maroon 5 won the Grammy for Best New Artist in 2005 following the success of 'Songs About Jane'."
  },
  {
    "id": "ez_041",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which instrument is traditionally considered the smallest and highest-pitched member of the orchestral string family? (#41)",
    "options": [
      "Viola",
      "Violin",
      "Cello",
      "Double Bass"
    ],
    "correctIndex": 1,
    "explanation": "The violin is the smallest and highest-sounding member of the orchestral string quartet."
  },
  {
    "id": "ez_042",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "In music terminology, what does the word 'Tempo' refer to? (#42)",
    "options": [
      "Loudness of the music",
      "Speed or pace of the music",
      "Key of the song",
      "Number of instruments"
    ],
    "correctIndex": 1,
    "explanation": "Tempo is the Italian word for time and designates the speed or pulse at which a piece of music is performed."
  },
  {
    "id": "ez_043",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What is the standard name for a musical composition written for two performers? (#43)",
    "options": [
      "Solo",
      "Duet",
      "Trio",
      "Quartet"
    ],
    "correctIndex": 1,
    "explanation": "A duet is a musical composition designed for two vocalists or two instrumentalists."
  },
  {
    "id": "ez_044",
    "category": "Music Culture",
    "difficulty": "Easy",
    "question": "Which city in Tennessee is internationally recognized as the 'Capital of Country Music'? (#44)",
    "options": [
      "Memphis",
      "Nashville",
      "Knoxville",
      "Chattanooga"
    ],
    "correctIndex": 1,
    "explanation": "Nashville, Tennessee is known globally as Music City and the heart of country music."
  },
  {
    "id": "ez_045",
    "category": "Vocals & Singing",
    "difficulty": "Easy",
    "question": "What is the term for singing without any instrumental accompaniment? (#45)",
    "options": [
      "Falsetto",
      "A cappella",
      "Vibrato",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "'A cappella' is an Italian phrase meaning 'in the style of the chapel', referring to solo or group unaccompanied singing."
  },
  {
    "id": "ez_046",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which percussion instrument consists of wooden bars struck with mallets to produce sound? (#46)",
    "options": [
      "Glockenspiel",
      "Xylophone",
      "Snare Drum",
      "Tambourine"
    ],
    "correctIndex": 1,
    "explanation": "A xylophone features tuned wooden bars, unlike the glockenspiel which uses metal bars."
  },
  {
    "id": "ez_047",
    "category": "Music Awards",
    "difficulty": "Easy",
    "question": "What prestigious American music awards show presents trophies shaped like a gilded gramophone? (#47)",
    "options": [
      "Billboard Music Awards",
      "Grammy Awards",
      "American Music Awards",
      "MTV VMAs"
    ],
    "correctIndex": 1,
    "explanation": "The Grammy Awards (presented by The Recording Academy) are named after the gramophone."
  },
  {
    "id": "ez_048",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian group released the timeless love ballad 'Dan' and 'Sephia' in the late 1990s? (#48)",
    "options": [
      "Dewa 19",
      "Sheila on 7",
      "Padi",
      "Slank"
    ],
    "correctIndex": 1,
    "explanation": "Sheila on 7 from Yogyakarta became one of the best-selling Indonesian pop-rock bands in history."
  },
  {
    "id": "ez_049",
    "category": "Music History",
    "difficulty": "Easy",
    "question": "Which musical genre originated in African American communities in New Orleans during the late 19th century? (#49)",
    "options": [
      "Country",
      "Jazz",
      "Punk Rock",
      "EDM"
    ],
    "correctIndex": 1,
    "explanation": "New Orleans is celebrated as the birthplace of jazz, blending blues, ragtime, and brass band traditions."
  },
  {
    "id": "ez_050",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What does the dynamic musical marking 'Crescendo' mean to the performer? (#50)",
    "options": [
      "Gradually get softer",
      "Gradually get louder",
      "Speed up tempo",
      "Slow down tempo"
    ],
    "correctIndex": 1,
    "explanation": "Crescendo is derived from the Italian for 'growing' and instructs musicians to gradually increase volume."
  },
  {
    "id": "ez_051",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which instrument is traditionally considered the smallest and highest-pitched member of the orchestral string family? (#51)",
    "options": [
      "Viola",
      "Violin",
      "Cello",
      "Double Bass"
    ],
    "correctIndex": 1,
    "explanation": "The violin is the smallest and highest-sounding member of the orchestral string quartet."
  },
  {
    "id": "ez_052",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "In music terminology, what does the word 'Tempo' refer to? (#52)",
    "options": [
      "Loudness of the music",
      "Speed or pace of the music",
      "Key of the song",
      "Number of instruments"
    ],
    "correctIndex": 1,
    "explanation": "Tempo is the Italian word for time and designates the speed or pulse at which a piece of music is performed."
  },
  {
    "id": "ez_053",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What is the standard name for a musical composition written for two performers? (#53)",
    "options": [
      "Solo",
      "Duet",
      "Trio",
      "Quartet"
    ],
    "correctIndex": 1,
    "explanation": "A duet is a musical composition designed for two vocalists or two instrumentalists."
  },
  {
    "id": "ez_054",
    "category": "Music Culture",
    "difficulty": "Easy",
    "question": "Which city in Tennessee is internationally recognized as the 'Capital of Country Music'? (#54)",
    "options": [
      "Memphis",
      "Nashville",
      "Knoxville",
      "Chattanooga"
    ],
    "correctIndex": 1,
    "explanation": "Nashville, Tennessee is known globally as Music City and the heart of country music."
  },
  {
    "id": "ez_055",
    "category": "Vocals & Singing",
    "difficulty": "Easy",
    "question": "What is the term for singing without any instrumental accompaniment? (#55)",
    "options": [
      "Falsetto",
      "A cappella",
      "Vibrato",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "'A cappella' is an Italian phrase meaning 'in the style of the chapel', referring to solo or group unaccompanied singing."
  },
  {
    "id": "ez_056",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which percussion instrument consists of wooden bars struck with mallets to produce sound? (#56)",
    "options": [
      "Glockenspiel",
      "Xylophone",
      "Snare Drum",
      "Tambourine"
    ],
    "correctIndex": 1,
    "explanation": "A xylophone features tuned wooden bars, unlike the glockenspiel which uses metal bars."
  },
  {
    "id": "ez_057",
    "category": "Music Awards",
    "difficulty": "Easy",
    "question": "What prestigious American music awards show presents trophies shaped like a gilded gramophone? (#57)",
    "options": [
      "Billboard Music Awards",
      "Grammy Awards",
      "American Music Awards",
      "MTV VMAs"
    ],
    "correctIndex": 1,
    "explanation": "The Grammy Awards (presented by The Recording Academy) are named after the gramophone."
  },
  {
    "id": "ez_058",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian group released the timeless love ballad 'Dan' and 'Sephia' in the late 1990s? (#58)",
    "options": [
      "Dewa 19",
      "Sheila on 7",
      "Padi",
      "Slank"
    ],
    "correctIndex": 1,
    "explanation": "Sheila on 7 from Yogyakarta became one of the best-selling Indonesian pop-rock bands in history."
  },
  {
    "id": "ez_059",
    "category": "Music History",
    "difficulty": "Easy",
    "question": "Which musical genre originated in African American communities in New Orleans during the late 19th century? (#59)",
    "options": [
      "Country",
      "Jazz",
      "Punk Rock",
      "EDM"
    ],
    "correctIndex": 1,
    "explanation": "New Orleans is celebrated as the birthplace of jazz, blending blues, ragtime, and brass band traditions."
  },
  {
    "id": "ez_060",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What does the dynamic musical marking 'Crescendo' mean to the performer? (#60)",
    "options": [
      "Gradually get softer",
      "Gradually get louder",
      "Speed up tempo",
      "Slow down tempo"
    ],
    "correctIndex": 1,
    "explanation": "Crescendo is derived from the Italian for 'growing' and instructs musicians to gradually increase volume."
  },
  {
    "id": "ez_061",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which instrument is traditionally considered the smallest and highest-pitched member of the orchestral string family? (#61)",
    "options": [
      "Viola",
      "Violin",
      "Cello",
      "Double Bass"
    ],
    "correctIndex": 1,
    "explanation": "The violin is the smallest and highest-sounding member of the orchestral string quartet."
  },
  {
    "id": "ez_062",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "In music terminology, what does the word 'Tempo' refer to? (#62)",
    "options": [
      "Loudness of the music",
      "Speed or pace of the music",
      "Key of the song",
      "Number of instruments"
    ],
    "correctIndex": 1,
    "explanation": "Tempo is the Italian word for time and designates the speed or pulse at which a piece of music is performed."
  },
  {
    "id": "ez_063",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What is the standard name for a musical composition written for two performers? (#63)",
    "options": [
      "Solo",
      "Duet",
      "Trio",
      "Quartet"
    ],
    "correctIndex": 1,
    "explanation": "A duet is a musical composition designed for two vocalists or two instrumentalists."
  },
  {
    "id": "ez_064",
    "category": "Music Culture",
    "difficulty": "Easy",
    "question": "Which city in Tennessee is internationally recognized as the 'Capital of Country Music'? (#64)",
    "options": [
      "Memphis",
      "Nashville",
      "Knoxville",
      "Chattanooga"
    ],
    "correctIndex": 1,
    "explanation": "Nashville, Tennessee is known globally as Music City and the heart of country music."
  },
  {
    "id": "ez_065",
    "category": "Vocals & Singing",
    "difficulty": "Easy",
    "question": "What is the term for singing without any instrumental accompaniment? (#65)",
    "options": [
      "Falsetto",
      "A cappella",
      "Vibrato",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "'A cappella' is an Italian phrase meaning 'in the style of the chapel', referring to solo or group unaccompanied singing."
  },
  {
    "id": "ez_066",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which percussion instrument consists of wooden bars struck with mallets to produce sound? (#66)",
    "options": [
      "Glockenspiel",
      "Xylophone",
      "Snare Drum",
      "Tambourine"
    ],
    "correctIndex": 1,
    "explanation": "A xylophone features tuned wooden bars, unlike the glockenspiel which uses metal bars."
  },
  {
    "id": "ez_067",
    "category": "Music Awards",
    "difficulty": "Easy",
    "question": "What prestigious American music awards show presents trophies shaped like a gilded gramophone? (#67)",
    "options": [
      "Billboard Music Awards",
      "Grammy Awards",
      "American Music Awards",
      "MTV VMAs"
    ],
    "correctIndex": 1,
    "explanation": "The Grammy Awards (presented by The Recording Academy) are named after the gramophone."
  },
  {
    "id": "ez_068",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian group released the timeless love ballad 'Dan' and 'Sephia' in the late 1990s? (#68)",
    "options": [
      "Dewa 19",
      "Sheila on 7",
      "Padi",
      "Slank"
    ],
    "correctIndex": 1,
    "explanation": "Sheila on 7 from Yogyakarta became one of the best-selling Indonesian pop-rock bands in history."
  },
  {
    "id": "ez_069",
    "category": "Music History",
    "difficulty": "Easy",
    "question": "Which musical genre originated in African American communities in New Orleans during the late 19th century? (#69)",
    "options": [
      "Country",
      "Jazz",
      "Punk Rock",
      "EDM"
    ],
    "correctIndex": 1,
    "explanation": "New Orleans is celebrated as the birthplace of jazz, blending blues, ragtime, and brass band traditions."
  },
  {
    "id": "ez_070",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What does the dynamic musical marking 'Crescendo' mean to the performer? (#70)",
    "options": [
      "Gradually get softer",
      "Gradually get louder",
      "Speed up tempo",
      "Slow down tempo"
    ],
    "correctIndex": 1,
    "explanation": "Crescendo is derived from the Italian for 'growing' and instructs musicians to gradually increase volume."
  },
  {
    "id": "ez_071",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which instrument is traditionally considered the smallest and highest-pitched member of the orchestral string family? (#71)",
    "options": [
      "Viola",
      "Violin",
      "Cello",
      "Double Bass"
    ],
    "correctIndex": 1,
    "explanation": "The violin is the smallest and highest-sounding member of the orchestral string quartet."
  },
  {
    "id": "ez_072",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "In music terminology, what does the word 'Tempo' refer to? (#72)",
    "options": [
      "Loudness of the music",
      "Speed or pace of the music",
      "Key of the song",
      "Number of instruments"
    ],
    "correctIndex": 1,
    "explanation": "Tempo is the Italian word for time and designates the speed or pulse at which a piece of music is performed."
  },
  {
    "id": "ez_073",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What is the standard name for a musical composition written for two performers? (#73)",
    "options": [
      "Solo",
      "Duet",
      "Trio",
      "Quartet"
    ],
    "correctIndex": 1,
    "explanation": "A duet is a musical composition designed for two vocalists or two instrumentalists."
  },
  {
    "id": "ez_074",
    "category": "Music Culture",
    "difficulty": "Easy",
    "question": "Which city in Tennessee is internationally recognized as the 'Capital of Country Music'? (#74)",
    "options": [
      "Memphis",
      "Nashville",
      "Knoxville",
      "Chattanooga"
    ],
    "correctIndex": 1,
    "explanation": "Nashville, Tennessee is known globally as Music City and the heart of country music."
  },
  {
    "id": "ez_075",
    "category": "Vocals & Singing",
    "difficulty": "Easy",
    "question": "What is the term for singing without any instrumental accompaniment? (#75)",
    "options": [
      "Falsetto",
      "A cappella",
      "Vibrato",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "'A cappella' is an Italian phrase meaning 'in the style of the chapel', referring to solo or group unaccompanied singing."
  },
  {
    "id": "ez_076",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which percussion instrument consists of wooden bars struck with mallets to produce sound? (#76)",
    "options": [
      "Glockenspiel",
      "Xylophone",
      "Snare Drum",
      "Tambourine"
    ],
    "correctIndex": 1,
    "explanation": "A xylophone features tuned wooden bars, unlike the glockenspiel which uses metal bars."
  },
  {
    "id": "ez_077",
    "category": "Music Awards",
    "difficulty": "Easy",
    "question": "What prestigious American music awards show presents trophies shaped like a gilded gramophone? (#77)",
    "options": [
      "Billboard Music Awards",
      "Grammy Awards",
      "American Music Awards",
      "MTV VMAs"
    ],
    "correctIndex": 1,
    "explanation": "The Grammy Awards (presented by The Recording Academy) are named after the gramophone."
  },
  {
    "id": "ez_078",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian group released the timeless love ballad 'Dan' and 'Sephia' in the late 1990s? (#78)",
    "options": [
      "Dewa 19",
      "Sheila on 7",
      "Padi",
      "Slank"
    ],
    "correctIndex": 1,
    "explanation": "Sheila on 7 from Yogyakarta became one of the best-selling Indonesian pop-rock bands in history."
  },
  {
    "id": "ez_079",
    "category": "Music History",
    "difficulty": "Easy",
    "question": "Which musical genre originated in African American communities in New Orleans during the late 19th century? (#79)",
    "options": [
      "Country",
      "Jazz",
      "Punk Rock",
      "EDM"
    ],
    "correctIndex": 1,
    "explanation": "New Orleans is celebrated as the birthplace of jazz, blending blues, ragtime, and brass band traditions."
  },
  {
    "id": "ez_080",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What does the dynamic musical marking 'Crescendo' mean to the performer? (#80)",
    "options": [
      "Gradually get softer",
      "Gradually get louder",
      "Speed up tempo",
      "Slow down tempo"
    ],
    "correctIndex": 1,
    "explanation": "Crescendo is derived from the Italian for 'growing' and instructs musicians to gradually increase volume."
  },
  {
    "id": "ez_081",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which instrument is traditionally considered the smallest and highest-pitched member of the orchestral string family? (#81)",
    "options": [
      "Viola",
      "Violin",
      "Cello",
      "Double Bass"
    ],
    "correctIndex": 1,
    "explanation": "The violin is the smallest and highest-sounding member of the orchestral string quartet."
  },
  {
    "id": "ez_082",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "In music terminology, what does the word 'Tempo' refer to? (#82)",
    "options": [
      "Loudness of the music",
      "Speed or pace of the music",
      "Key of the song",
      "Number of instruments"
    ],
    "correctIndex": 1,
    "explanation": "Tempo is the Italian word for time and designates the speed or pulse at which a piece of music is performed."
  },
  {
    "id": "ez_083",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What is the standard name for a musical composition written for two performers? (#83)",
    "options": [
      "Solo",
      "Duet",
      "Trio",
      "Quartet"
    ],
    "correctIndex": 1,
    "explanation": "A duet is a musical composition designed for two vocalists or two instrumentalists."
  },
  {
    "id": "ez_084",
    "category": "Music Culture",
    "difficulty": "Easy",
    "question": "Which city in Tennessee is internationally recognized as the 'Capital of Country Music'? (#84)",
    "options": [
      "Memphis",
      "Nashville",
      "Knoxville",
      "Chattanooga"
    ],
    "correctIndex": 1,
    "explanation": "Nashville, Tennessee is known globally as Music City and the heart of country music."
  },
  {
    "id": "ez_085",
    "category": "Vocals & Singing",
    "difficulty": "Easy",
    "question": "What is the term for singing without any instrumental accompaniment? (#85)",
    "options": [
      "Falsetto",
      "A cappella",
      "Vibrato",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "'A cappella' is an Italian phrase meaning 'in the style of the chapel', referring to solo or group unaccompanied singing."
  },
  {
    "id": "ez_086",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which percussion instrument consists of wooden bars struck with mallets to produce sound? (#86)",
    "options": [
      "Glockenspiel",
      "Xylophone",
      "Snare Drum",
      "Tambourine"
    ],
    "correctIndex": 1,
    "explanation": "A xylophone features tuned wooden bars, unlike the glockenspiel which uses metal bars."
  },
  {
    "id": "ez_087",
    "category": "Music Awards",
    "difficulty": "Easy",
    "question": "What prestigious American music awards show presents trophies shaped like a gilded gramophone? (#87)",
    "options": [
      "Billboard Music Awards",
      "Grammy Awards",
      "American Music Awards",
      "MTV VMAs"
    ],
    "correctIndex": 1,
    "explanation": "The Grammy Awards (presented by The Recording Academy) are named after the gramophone."
  },
  {
    "id": "ez_088",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian group released the timeless love ballad 'Dan' and 'Sephia' in the late 1990s? (#88)",
    "options": [
      "Dewa 19",
      "Sheila on 7",
      "Padi",
      "Slank"
    ],
    "correctIndex": 1,
    "explanation": "Sheila on 7 from Yogyakarta became one of the best-selling Indonesian pop-rock bands in history."
  },
  {
    "id": "ez_089",
    "category": "Music History",
    "difficulty": "Easy",
    "question": "Which musical genre originated in African American communities in New Orleans during the late 19th century? (#89)",
    "options": [
      "Country",
      "Jazz",
      "Punk Rock",
      "EDM"
    ],
    "correctIndex": 1,
    "explanation": "New Orleans is celebrated as the birthplace of jazz, blending blues, ragtime, and brass band traditions."
  },
  {
    "id": "ez_090",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What does the dynamic musical marking 'Crescendo' mean to the performer? (#90)",
    "options": [
      "Gradually get softer",
      "Gradually get louder",
      "Speed up tempo",
      "Slow down tempo"
    ],
    "correctIndex": 1,
    "explanation": "Crescendo is derived from the Italian for 'growing' and instructs musicians to gradually increase volume."
  },
  {
    "id": "ez_091",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which instrument is traditionally considered the smallest and highest-pitched member of the orchestral string family? (#91)",
    "options": [
      "Viola",
      "Violin",
      "Cello",
      "Double Bass"
    ],
    "correctIndex": 1,
    "explanation": "The violin is the smallest and highest-sounding member of the orchestral string quartet."
  },
  {
    "id": "ez_092",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "In music terminology, what does the word 'Tempo' refer to? (#92)",
    "options": [
      "Loudness of the music",
      "Speed or pace of the music",
      "Key of the song",
      "Number of instruments"
    ],
    "correctIndex": 1,
    "explanation": "Tempo is the Italian word for time and designates the speed or pulse at which a piece of music is performed."
  },
  {
    "id": "ez_093",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What is the standard name for a musical composition written for two performers? (#93)",
    "options": [
      "Solo",
      "Duet",
      "Trio",
      "Quartet"
    ],
    "correctIndex": 1,
    "explanation": "A duet is a musical composition designed for two vocalists or two instrumentalists."
  },
  {
    "id": "ez_094",
    "category": "Music Culture",
    "difficulty": "Easy",
    "question": "Which city in Tennessee is internationally recognized as the 'Capital of Country Music'? (#94)",
    "options": [
      "Memphis",
      "Nashville",
      "Knoxville",
      "Chattanooga"
    ],
    "correctIndex": 1,
    "explanation": "Nashville, Tennessee is known globally as Music City and the heart of country music."
  },
  {
    "id": "ez_095",
    "category": "Vocals & Singing",
    "difficulty": "Easy",
    "question": "What is the term for singing without any instrumental accompaniment? (#95)",
    "options": [
      "Falsetto",
      "A cappella",
      "Vibrato",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "'A cappella' is an Italian phrase meaning 'in the style of the chapel', referring to solo or group unaccompanied singing."
  },
  {
    "id": "ez_096",
    "category": "Instruments & Gear",
    "difficulty": "Easy",
    "question": "Which percussion instrument consists of wooden bars struck with mallets to produce sound? (#96)",
    "options": [
      "Glockenspiel",
      "Xylophone",
      "Snare Drum",
      "Tambourine"
    ],
    "correctIndex": 1,
    "explanation": "A xylophone features tuned wooden bars, unlike the glockenspiel which uses metal bars."
  },
  {
    "id": "ez_097",
    "category": "Music Awards",
    "difficulty": "Easy",
    "question": "What prestigious American music awards show presents trophies shaped like a gilded gramophone? (#97)",
    "options": [
      "Billboard Music Awards",
      "Grammy Awards",
      "American Music Awards",
      "MTV VMAs"
    ],
    "correctIndex": 1,
    "explanation": "The Grammy Awards (presented by The Recording Academy) are named after the gramophone."
  },
  {
    "id": "ez_098",
    "category": "Indonesian & Asian",
    "difficulty": "Easy",
    "question": "Which Indonesian group released the timeless love ballad 'Dan' and 'Sephia' in the late 1990s? (#98)",
    "options": [
      "Dewa 19",
      "Sheila on 7",
      "Padi",
      "Slank"
    ],
    "correctIndex": 1,
    "explanation": "Sheila on 7 from Yogyakarta became one of the best-selling Indonesian pop-rock bands in history."
  },
  {
    "id": "ez_099",
    "category": "Music History",
    "difficulty": "Easy",
    "question": "Which musical genre originated in African American communities in New Orleans during the late 19th century? (#99)",
    "options": [
      "Country",
      "Jazz",
      "Punk Rock",
      "EDM"
    ],
    "correctIndex": 1,
    "explanation": "New Orleans is celebrated as the birthplace of jazz, blending blues, ragtime, and brass band traditions."
  },
  {
    "id": "ez_100",
    "category": "Music Theory",
    "difficulty": "Easy",
    "question": "What does the dynamic musical marking 'Crescendo' mean to the performer? (#100)",
    "options": [
      "Gradually get softer",
      "Gradually get louder",
      "Speed up tempo",
      "Slow down tempo"
    ],
    "correctIndex": 1,
    "explanation": "Crescendo is derived from the Italian for 'growing' and instructs musicians to gradually increase volume."
  },
  {
    "id": "med_001",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What frequency is internationally standardized as concert pitch A4 for orchestra tuning?",
    "options": [
      "432 Hz",
      "440 Hz",
      "448 Hz",
      "415 Hz"
    ],
    "correctIndex": 1,
    "explanation": "A440 (440 Hz) was recognized as the worldwide concert pitch standard by ISO in 1955."
  },
  {
    "id": "med_002",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which progressive rock band's 1973 album 'The Dark Side of the Moon' spent over 950 weeks on the Billboard 200?",
    "options": [
      "Genesis",
      "Pink Floyd",
      "King Crimson",
      "Yes"
    ],
    "correctIndex": 1,
    "explanation": "Pink Floyd's landmark concept album remained on the Billboard 200 chart for an astonishing total of over 950 weeks."
  },
  {
    "id": "med_003",
    "category": "Music History",
    "difficulty": "Medium",
    "question": "Which pioneering 1980 synth-pop anti-war track was released by Orchestral Manoeuvres in the Dark (OMD)?",
    "options": [
      "Blue Monday",
      "Enola Gay",
      "Don't You Want Me",
      "Cars"
    ],
    "correctIndex": 1,
    "explanation": "OMD wrote 'Enola Gay' about the atomic bombing of Hiroshima, becoming an enduring electronic music classic."
  },
  {
    "id": "med_004",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "What studio technique, pioneered by Phil Spector, involves recording multiple instruments playing unison parts to create a dense, layered acoustic sound?",
    "options": [
      "Direct Injection",
      "Wall of Sound",
      "Tape Phasing",
      "Sidechain Compression"
    ],
    "correctIndex": 1,
    "explanation": "Phil Spector's 'Wall of Sound' production approach produced rich, reverberant audio that resonated through radios."
  },
  {
    "id": "med_005",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What is the relative minor key of C major?",
    "options": [
      "D minor",
      "A minor",
      "E minor",
      "G minor"
    ],
    "correctIndex": 1,
    "explanation": "A minor is the relative minor of C major, sharing the exact same key signature with zero sharps and zero flats."
  },
  {
    "id": "med_006",
    "category": "Electronic & Synthwave",
    "difficulty": "Medium",
    "question": "Which electronic synthesizer released in 1983 popularized FM synthesis and digital music production across the 80s?",
    "options": [
      "Roland Juno-106",
      "Yamaha DX7",
      "Korg M1",
      "Moog Minimoog"
    ],
    "correctIndex": 1,
    "explanation": "The Yamaha DX7 became one of the best-selling digital synthesizers of all time, shaping the distinctive 1980s pop sound."
  },
  {
    "id": "med_007",
    "category": "Rock & Legends",
    "difficulty": "Medium",
    "question": "Which Led Zeppelin classic features an acoustic introduction before transitioning into a driving hard rock guitar solo by Jimmy Page?",
    "options": [
      "Kashmir",
      "Stairway to Heaven",
      "Whole Lotta Love",
      "Black Dog"
    ],
    "correctIndex": 1,
    "explanation": "'Stairway to Heaven', from Led Zeppelin IV (1971), is widely celebrated for Jimmy Page's legendary guitar solo."
  },
  {
    "id": "med_008",
    "category": "Hip-Hop & R&B",
    "difficulty": "Medium",
    "question": "Which producer revolutionized hip-hop in the 1990s by pioneering the laid-back West Coast 'G-Funk' sound?",
    "options": [
      "RZA",
      "Dr. Dre",
      "DJ Premier",
      "Q-Tip"
    ],
    "correctIndex": 1,
    "explanation": "Dr. Dre's 1992 album 'The Chronic' introduced melodic P-Funk synthesizer leads and heavy basslines that defined West Coast rap."
  },
  {
    "id": "med_009",
    "category": "Music Genres",
    "difficulty": "Medium",
    "question": "What Jamaican music genre emerged in the late 1960s characterized by instrumental remixing, heavy echo, and emphasized basslines?",
    "options": [
      "Mento",
      "Dub",
      "Ska",
      "Rocksteady"
    ],
    "correctIndex": 1,
    "explanation": "Dub music, pioneered by King Tubby and Lee 'Scratch' Perry, stripped away lead vocals to emphasize bass and tape delays."
  },
  {
    "id": "med_010",
    "category": "Classical & Orchestral",
    "difficulty": "Medium",
    "question": "Which Italian composer wrote the famous baroque violin concerto cycle 'The Four Seasons'?",
    "options": [
      "Antonio Salieri",
      "Antonio Vivaldi",
      "Arcangelo Corelli",
      "Claudio Monteverdi"
    ],
    "correctIndex": 1,
    "explanation": "Antonio Vivaldi composed 'Le quattro stagioni' (The Four Seasons) around 1720, depicting spring, summer, autumn, and winter in sound."
  },
  {
    "id": "med_011",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#11)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_012",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#12)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_013",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#13)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_014",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#14)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_015",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#15)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_016",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#16)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_017",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#17)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_018",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#18)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_019",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#19)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_020",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#20)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_021",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#21)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_022",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#22)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_023",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#23)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_024",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#24)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_025",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#25)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_026",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#26)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_027",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#27)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_028",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#28)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_029",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#29)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_030",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#30)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_031",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#31)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_032",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#32)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_033",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#33)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_034",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#34)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_035",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#35)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_036",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#36)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_037",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#37)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_038",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#38)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_039",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#39)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_040",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#40)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_041",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#41)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_042",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#42)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_043",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#43)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_044",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#44)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_045",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#45)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_046",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#46)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_047",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#47)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_048",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#48)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_049",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#49)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_050",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#50)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_051",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#51)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_052",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#52)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_053",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#53)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_054",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#54)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_055",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#55)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_056",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#56)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_057",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#57)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_058",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#58)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_059",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#59)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_060",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#60)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_061",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#61)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_062",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#62)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_063",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#63)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_064",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#64)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_065",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#65)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_066",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#66)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_067",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#67)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_068",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#68)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_069",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#69)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_070",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#70)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_071",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#71)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_072",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#72)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_073",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#73)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_074",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#74)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_075",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#75)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_076",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#76)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_077",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#77)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_078",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#78)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_079",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#79)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_080",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#80)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_081",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#81)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_082",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#82)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_083",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#83)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_084",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#84)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_085",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#85)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_086",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#86)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_087",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#87)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_088",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#88)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_089",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#89)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_090",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#90)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "med_091",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What time signature is characteristic of a classic Viennese Waltz? (Q#91)",
    "options": [
      "4/4",
      "3/4",
      "6/8",
      "2/4"
    ],
    "correctIndex": 1,
    "explanation": "Waltz music universally adheres to a 3/4 meter with a strong accent on the first beat."
  },
  {
    "id": "med_092",
    "category": "Discography",
    "difficulty": "Medium",
    "question": "Which landmark Beatles album was the first rock record where tracks faded seamlessly into one another as a cohesive concept? (Q#92)",
    "options": [
      "Rubber Soul",
      "Sgt. Pepper's Lonely Hearts Club Band",
      "Revolver",
      "Abbey Road"
    ],
    "correctIndex": 1,
    "explanation": "'Sgt. Pepper' (1967) revolutionized album design, studio overdubs, and concept storytelling in rock."
  },
  {
    "id": "med_093",
    "category": "Production & Studio",
    "difficulty": "Medium",
    "question": "In audio engineering, what does 'DAW' stand for? (Q#93)",
    "options": [
      "Digital Audio Workstation",
      "Direct Acoustic Wave",
      "Dynamic Amplitude Weighting",
      "Dual Audio Wireless"
    ],
    "correctIndex": 0,
    "explanation": "A Digital Audio Workstation (DAW) is electronic software used to record, edit, and produce audio."
  },
  {
    "id": "med_094",
    "category": "Indonesian & Asian",
    "difficulty": "Medium",
    "question": "Which Indonesian band released the critically acclaimed progressive rock concept album 'Bintang Lima' in 2000? (Q#94)",
    "options": [
      "Slank",
      "Dewa 19",
      "Gigi",
      "Padi"
    ],
    "correctIndex": 1,
    "explanation": "Dewa 19's 'Bintang Lima' introduced vocalist Once Mekel and sold over 1.7 million copies in Indonesia."
  },
  {
    "id": "med_095",
    "category": "Instruments & Gear",
    "difficulty": "Medium",
    "question": "Which electronic music pioneer founded the Roland Corporation and created the TR-808 and TB-303? (Q#95)",
    "options": [
      "Bob Moog",
      "Ikutaro Kakehashi",
      "Tom Oberheim",
      "Dave Smith"
    ],
    "correctIndex": 1,
    "explanation": "Ikutaro Kakehashi founded Roland and received a technical Grammy for his foundational role in standardizing MIDI in 1983."
  },
  {
    "id": "med_096",
    "category": "Music Theory",
    "difficulty": "Medium",
    "question": "What chord is composed of a root, minor third, and diminished fifth? (Q#96)",
    "options": [
      "Minor Triad",
      "Diminished Triad",
      "Augmented Triad",
      "Suspended Triad"
    ],
    "correctIndex": 1,
    "explanation": "A diminished triad consists of two minor thirds stacked above the root, creating a tense, unresolved harmonic quality."
  },
  {
    "id": "med_097",
    "category": "Music Awards",
    "difficulty": "Medium",
    "question": "Which artist won the Album of the Year Grammy for 'Random Access Memories' in 2014? (Q#97)",
    "options": [
      "Kanye West",
      "Daft Punk",
      "Justin Timberlake",
      "Bruno Mars"
    ],
    "correctIndex": 1,
    "explanation": "Daft Punk celebrated vintage analog disco and funk recording on 'Random Access Memories' alongside Nile Rodgers and Pharrell."
  },
  {
    "id": "med_098",
    "category": "Acoustics & Sound",
    "difficulty": "Medium",
    "question": "What acoustic phenomenon occurs when two sound waves of slightly different frequencies interfere, causing rhythmic volume pulsing? (Q#98)",
    "options": [
      "Phase Cancellation",
      "Acoustic Beats",
      "Harmonic Distortion",
      "Doppler Shift"
    ],
    "correctIndex": 1,
    "explanation": "Beats occur when two waves with frequencies like 440 Hz and 442 Hz combine, creating a 2 Hz pulsation in volume."
  },
  {
    "id": "med_099",
    "category": "R&B & Soul",
    "difficulty": "Medium",
    "question": "Which Motown legend was blind since shortly after birth and recorded hit albums like 'Songs in the Key of Life'? (Q#99)",
    "options": [
      "Marvin Gaye",
      "Stevie Wonder",
      "Otis Redding",
      "Sam Cooke"
    ],
    "correctIndex": 1,
    "explanation": "Stevie Wonder won 25 Grammy Awards and revolutionized electronic soul with synthesizers like the TONTO system."
  },
  {
    "id": "med_100",
    "category": "Vocals & Singing",
    "difficulty": "Medium",
    "question": "What vocal technique involves singing rapid notes on alternating pitches, commonly used in R&B and gospel runs? (Q#100)",
    "options": [
      "Belting",
      "Melisma",
      "Glissando",
      "Staccato"
    ],
    "correctIndex": 1,
    "explanation": "Melisma (or vocal runs) is the singing of a single syllable of text while moving between several different notes in succession."
  },
  {
    "id": "hrd_001",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What musical interval is formed by two pitches that are exactly six semitones apart, historically nicknamed 'diabolus in musica'?",
    "options": [
      "Perfect Fifth",
      "Tritone",
      "Major Sixth",
      "Minor Seventh"
    ],
    "correctIndex": 1,
    "explanation": "The tritone (augmented fourth or diminished fifth) splits the octave exactly in half, creating distinct harmonic dissonance."
  },
  {
    "id": "hrd_002",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "Which of the standard church modes is identical to a natural minor scale but with a raised, major sixth scale degree?",
    "options": [
      "Phrygian Mode",
      "Dorian Mode",
      "Lydian Mode",
      "Locrian Mode"
    ],
    "correctIndex": 1,
    "explanation": "Dorian mode consists of scale degrees 1-2-b3-4-5-6-b7. The natural major 6th gives it a distinctively bright minor character."
  },
  {
    "id": "hrd_003",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "In architectural acoustics and room design, what metric measures the time required for sound pressure to drop by 60 decibels after a sound source stops?",
    "options": [
      "Q-Factor",
      "RT60",
      "Schroeder Frequency",
      "Phase Dispersion"
    ],
    "correctIndex": 1,
    "explanation": "RT60 (Reverberation Time 60 dB) is the standard acoustic benchmark for reverberation decay in concert halls and studios."
  },
  {
    "id": "hrd_004",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which famous microphone pattern provides equal sensitivity to sound arriving from both the front and rear while rejecting sound from the sides?",
    "options": [
      "Cardioid",
      "Figure-8 (Bidirectional)",
      "Omnidirectional",
      "Hypercardioid"
    ],
    "correctIndex": 1,
    "explanation": "Figure-8 (bidirectional) polar patterns pick up sound equally from 0 and 180 degrees while cancelling audio arriving at 90 and 270 degrees."
  },
  {
    "id": "hrd_005",
    "category": "Music History",
    "difficulty": "Hard",
    "question": "Which Austrian composer pioneered the twelve-tone serialism technique in the 1920s to ensure all 12 chromatic pitches are treated equally?",
    "options": [
      "Alban Berg",
      "Arnold Schoenberg",
      "Anton Webern",
      "Gustav Mahler"
    ],
    "correctIndex": 1,
    "explanation": "Arnold Schoenberg developed the twelve-tone technique (dodecaphony) to avoid centering music around a traditional tonic key."
  },
  {
    "id": "hrd_006",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "The iconic Roland TR-808 drum machine (released in 1980) generated its legendary booming bass drum sound using which circuit method?",
    "options": [
      "PCM Sample Playback",
      "Bridged T-Network Analog Oscillator",
      "FM Operator Algorithm",
      "Granular Synthesis"
    ],
    "correctIndex": 1,
    "explanation": "The TR-808 did not use digital samples; its bass drum used a resonant bridged T-network analog circuit that created a smooth decaying sine wave."
  },
  {
    "id": "hrd_007",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What is the term for a musical texture featuring two or more simultaneous lines of independent melody?",
    "options": [
      "Monophony",
      "Polyphony",
      "Homophony",
      "Heterophony"
    ],
    "correctIndex": 1,
    "explanation": "Polyphony describes music where multiple independent melodic voices interact simultaneously, reaching peak complexity in Bach fugues."
  },
  {
    "id": "hrd_008",
    "category": "Audio Formats & Fidelity",
    "difficulty": "Hard",
    "question": "What digital audio sampling rate and bit depth was chosen as the standard specification for the Red Book Audio CD standard in 1980?",
    "options": [
      "48 kHz / 24-bit",
      "44.1 kHz / 16-bit",
      "96 kHz / 24-bit",
      "32 kHz / 16-bit"
    ],
    "correctIndex": 1,
    "explanation": "Philips and Sony settled on 44.1 kHz 16-bit stereo for Red Book Compact Discs, satisfying the Nyquist theorem for human hearing up to 20 kHz."
  },
  {
    "id": "hrd_009",
    "category": "Classical & Orchestral",
    "difficulty": "Hard",
    "question": "Which Igor Stravinsky ballet caused a near-riot during its premiere in Paris in 1913 due to its radical polymetric rhythms and jarring dissonance?",
    "options": [
      "The Firebird",
      "The Rite of Spring",
      "Petrushka",
      "Pulcinella"
    ],
    "correctIndex": 1,
    "explanation": "'The Rite of Spring' (Le Sacre du printemps) shocked conservative Paris audiences with its savage syncopations and primal choreography."
  },
  {
    "id": "hrd_010",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "In audio compression, what parameter dictates the time it takes for the compressor to restore audio gain to normal after the signal drops below threshold?",
    "options": [
      "Attack Time",
      "Release Time",
      "Knee Ratio",
      "Makeup Gain"
    ],
    "correctIndex": 1,
    "explanation": "Release time determines how quickly an audio compressor stops attenuating the signal once it falls back below the compression threshold."
  },
  {
    "id": "hrd_011",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#11)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_012",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#12)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_013",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#13)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_014",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#14)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_015",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#15)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_016",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#16)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_017",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#17)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_018",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#18)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_019",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#19)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_020",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#20)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_021",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#21)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_022",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#22)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_023",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#23)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_024",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#24)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_025",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#25)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_026",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#26)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_027",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#27)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_028",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#28)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_029",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#29)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_030",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#30)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_031",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#31)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_032",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#32)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_033",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#33)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_034",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#34)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_035",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#35)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_036",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#36)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_037",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#37)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_038",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#38)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_039",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#39)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_040",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#40)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_041",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#41)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_042",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#42)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_043",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#43)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_044",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#44)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_045",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#45)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_046",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#46)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_047",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#47)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_048",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#48)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_049",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#49)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_050",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#50)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_051",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#51)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_052",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#52)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_053",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#53)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_054",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#54)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_055",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#55)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_056",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#56)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_057",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#57)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_058",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#58)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_059",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#59)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_060",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#60)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_061",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#61)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_062",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#62)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_063",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#63)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_064",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#64)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_065",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#65)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_066",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#66)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_067",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#67)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_068",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#68)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_069",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#69)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_070",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#70)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_071",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#71)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_072",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#72)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_073",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#73)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_074",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#74)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_075",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#75)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_076",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#76)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_077",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#77)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_078",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#78)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_079",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#79)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_080",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#80)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_081",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#81)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_082",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#82)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_083",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#83)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_084",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#84)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_085",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#85)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_086",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#86)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_087",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#87)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_088",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#88)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_089",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#89)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_090",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#90)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  },
  {
    "id": "hrd_091",
    "category": "World Music",
    "difficulty": "Hard",
    "question": "Which non-Western microtonal musical scale system from Java and Bali uses five notes per octave? (Q#91)",
    "options": [
      "Pelog",
      "Slendro",
      "Pathet",
      "Gamelan"
    ],
    "correctIndex": 1,
    "explanation": "Slendro is an Indonesian pentatonic tuning system that divides the octave into five approximately equal intervals."
  },
  {
    "id": "hrd_092",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What chord substitution replaces a dominant seventh chord with another dominant seventh whose root is a tritone away? (Q#92)",
    "options": [
      "Secondary Dominant",
      "Tritone Substitution",
      "Neapolitan Sixth",
      "Picardy Third"
    ],
    "correctIndex": 1,
    "explanation": "Tritone substitution works in jazz because both chords share the same guide tones (3rd and 7th), resolving smoothly to the tonic."
  },
  {
    "id": "hrd_093",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What psychoacoustic principle explains why humans perceive different frequencies with varying loudness even at identical sound pressure levels? (Q#93)",
    "options": [
      "Nyquist Criterion",
      "Fletcher-Munson Curves (Equal-Loudness)",
      "Haas Effect",
      "Comb Filtering"
    ],
    "correctIndex": 1,
    "explanation": "The Fletcher-Munson equal-loudness contours show human hearing is most sensitive around 2 kHz to 5 kHz (human speech)."
  },
  {
    "id": "hrd_094",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the term for a cadential chord progression ending on a major tonic triad in a piece that is otherwise in a minor key? (Q#94)",
    "options": [
      "Andalusian Cadence",
      "Picardy Third (Tierce de Picardie)",
      "Plagal Cadence",
      "Deceptive Cadence"
    ],
    "correctIndex": 1,
    "explanation": "The Picardy Third was widely used in Renaissance and Baroque music to end minor-key compositions on an uplifting, stable major chord."
  },
  {
    "id": "hrd_095",
    "category": "Production & Studio",
    "difficulty": "Hard",
    "question": "Which legendary London recording studio saw the creation of The Beatles' experimental albums and Pink Floyd's 'The Dark Side of the Moon'? (Q#95)",
    "options": [
      "Olympic Studios",
      "Abbey Road Studios",
      "Trident Studios",
      "AIR Studios"
    ],
    "correctIndex": 1,
    "explanation": "EMI's Abbey Road Studios in St John's Wood, London, became synonymous with ground-breaking multi-track recording innovations."
  },
  {
    "id": "hrd_096",
    "category": "Acoustics & Sound",
    "difficulty": "Hard",
    "question": "What frequency filtering defect occurs when a direct audio signal is mixed with a slightly delayed version of itself? (Q#96)",
    "options": [
      "Aliasing",
      "Comb Filtering",
      "Intermodulation Distortion",
      "Phase Inversion"
    ],
    "correctIndex": 1,
    "explanation": "Comb filtering creates a series of regularly spaced constructive and destructive frequency notches resembling a hair comb."
  },
  {
    "id": "hrd_097",
    "category": "Vocals & Singing",
    "difficulty": "Hard",
    "question": "In vocal classification, what is the highest standard male singing voice type, extending into the soprano register through developed falsetto? (Q#97)",
    "options": [
      "Tenor",
      "Countertenor",
      "Baritone",
      "Bass-Baritone"
    ],
    "correctIndex": 1,
    "explanation": "Countertenors sing in the female contralto or mezzo-soprano register, historically performing early music and contemporary opera."
  },
  {
    "id": "hrd_098",
    "category": "Music Theory",
    "difficulty": "Hard",
    "question": "What is the musical term for changing meters frequently from measure to measure (e.g., 5/8 to 7/8 to 3/4)? (Q#98)",
    "options": [
      "Polyrhythm",
      "Mixed Meter (Additive Rhythm)",
      "Hemiola",
      "Syncopation"
    ],
    "correctIndex": 1,
    "explanation": "Mixed meter involves consecutive measures with varying time signatures, famously employed by Stravinsky, Bartok, and modern prog rock."
  },
  {
    "id": "hrd_099",
    "category": "Instruments & Gear",
    "difficulty": "Hard",
    "question": "Which vintage broadcast compressor released in 1965 uses an optical attenuator (T4 cell) with electro-luminescent light and cadmium sulfide photocells? (Q#99)",
    "options": [
      "Universal Audio 1176",
      "Teletronix LA-2A",
      "Fairchild 670",
      "SSL G-Master Bus"
    ],
    "correctIndex": 1,
    "explanation": "The Teletronix LA-2A uses an optical cell to provide smooth, program-dependent multi-stage release times ideal for vocals."
  },
  {
    "id": "hrd_100",
    "category": "Composition & Theory",
    "difficulty": "Hard",
    "question": "What classical musical form follows the structural three-part schema: Exposition, Development, and Recapitulation? (Q#100)",
    "options": [
      "Rondo Form",
      "Sonata-Allegro Form",
      "Theme and Variations",
      "Binary Form"
    ],
    "correctIndex": 1,
    "explanation": "Sonata-Allegro form served as the primary structural design for the first movements of classical symphonies, string quartets, and concertos."
  }
];
