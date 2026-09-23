import type { Question } from '@/types/question';

export const questions: Question[] = [
  // ידע כללי
  {
    id: 'gk-1',
    categoryId: 'general-knowledge',
    question: 'כמה ימים יש בשנה מעוברת?',
    answers: ['365', '366', '364', '367'],
    correctIndex: 1,
  },
  {
    id: 'gk-2',
    categoryId: 'general-knowledge',
    question: 'מה הסמל הכימי של זהב?',
    answers: ['Ag', 'Gd', 'Au', 'Go'],
    correctIndex: 2,
  },
  {
    id: 'gk-3',
    categoryId: 'general-knowledge',
    question: 'כמה רגליים יש לעכביש?',
    answers: ['שש', 'שמונה', 'עשר', 'ארבע'],
    correctIndex: 1,
  },
  {
    id: 'gk-4',
    categoryId: 'general-knowledge',
    question: 'מי צייר את המונה ליזה?',
    answers: ['לאונרדו דה וינצ׳י', 'מיכלאנג׳לו', 'רפאל', 'וינסנט ואן גוך'],
    correctIndex: 0,
  },
  {
    id: 'gk-5',
    categoryId: 'general-knowledge',
    question: 'מהו כוכב הלכת הגדול ביותר במערכת השמש?',
    answers: ['שבתאי', 'נפטון', 'כדור הארץ', 'צדק'],
    correctIndex: 3,
  },

  // גאוגרפיה
  {
    id: 'geo-1',
    categoryId: 'geography',
    question: 'מהי בירת אוסטרליה?',
    answers: ['סידני', 'מלבורן', 'קנברה', 'פרת׳'],
    correctIndex: 2,
  },
  {
    id: 'geo-2',
    categoryId: 'geography',
    question: 'מהו הנהר הארוך ביותר באפריקה?',
    answers: ['הנילוס', 'הקונגו', 'הניגר', 'הזמבזי'],
    correctIndex: 0,
  },
  {
    id: 'geo-3',
    categoryId: 'geography',
    question: 'באיזו יבשת נמצאת מדינת פרו?',
    answers: ['אפריקה', 'דרום אמריקה', 'אסיה', 'צפון אמריקה'],
    correctIndex: 1,
  },
  {
    id: 'geo-4',
    categoryId: 'geography',
    question: 'מהו ההר הגבוה בעולם?',
    answers: ['קילימנג׳רו', 'מון בלאן', 'K2', 'האוורסט'],
    correctIndex: 3,
  },
  {
    id: 'geo-5',
    categoryId: 'geography',
    question: 'איזה ים הוא הנקודה הנמוכה ביותר על פני היבשה?',
    answers: ['ים המלח', 'הים הכספי', 'ים כנרת', 'הים האדום'],
    correctIndex: 0,
  },

  // קולנוע וטלוויזיה
  {
    id: 'tv-1',
    categoryId: 'film-and-tv',
    question: 'מי ביים את הסרט ״פארק היורה״?',
    answers: ['ג׳יימס קמרון', 'סטיבן ספילברג', 'ג׳ורג׳ לוקאס', 'רידלי סקוט'],
    correctIndex: 1,
  },
  {
    id: 'tv-2',
    categoryId: 'film-and-tv',
    question: 'באיזו סדרה מופיעה הדמות וולטר וייט?',
    answers: ['הסופרנוס', 'הסמויה', 'שובר שורות', 'מד מן'],
    correctIndex: 2,
  },
  {
    id: 'tv-3',
    categoryId: 'film-and-tv',
    question: 'איך קוראים לקוסם הצעיר בסדרת הספרים והסרטים של ג׳יי. קיי. רולינג?',
    answers: ['פרודו באגינס', 'הארי פוטר', 'פרסי ג׳קסון', 'לוק סקייווקר'],
    correctIndex: 1,
  },
  {
    id: 'tv-4',
    categoryId: 'film-and-tv',
    question: 'איזה סרט זכה באוסקר לסרט הטוב ביותר בשנת 1998?',
    answers: ['טיטאניק', 'פורסט גאמפ', 'גלדיאטור', 'רשימת שינדלר'],
    correctIndex: 0,
  },
  {
    id: 'tv-5',
    categoryId: 'film-and-tv',
    question: 'באיזו עיר מתרחשת הסדרה ״חברים״?',
    answers: ['לוס אנג׳לס', 'שיקגו', 'בוסטון', 'ניו יורק'],
    correctIndex: 3,
  },

  // טכנולוגיה
  {
    id: 'tech-1',
    categoryId: 'technology',
    question: 'מה פירוש הראשי התיבות CPU?',
    answers: ['יחידת עיבוד מרכזית', 'יחידת זיכרון ראשית', 'כרטיס גרפי', 'ספק כוח'],
    correctIndex: 0,
  },
  {
    id: 'tech-2',
    categoryId: 'technology',
    question: 'איזו חברה פיתחה את מערכת ההפעלה אנדרואיד?',
    answers: ['אפל', 'מיקרוסופט', 'גוגל', 'סמסונג'],
    correctIndex: 2,
  },
  {
    id: 'tech-3',
    categoryId: 'technology',
    question: 'כמה ביטים יש בבייט אחד?',
    answers: ['4', '8', '16', '32'],
    correctIndex: 1,
  },
  {
    id: 'tech-4',
    categoryId: 'technology',
    question: 'מי ייסד את חברת מיקרוסופט יחד עם פול אלן?',
    answers: ['סטיב ג׳ובס', 'מארק צוקרברג', 'ג׳ף בזוס', 'ביל גייטס'],
    correctIndex: 3,
  },
  {
    id: 'tech-5',
    categoryId: 'technology',
    question: 'באיזו שפה כתובים דפי אינטרנט בבסיסם?',
    answers: ['HTML', 'Python', 'C++', 'SQL'],
    correctIndex: 0,
  },
];

export function getQuestionsByCategory(categoryId: string): Question[] {
  return questions.filter((question) => question.categoryId === categoryId);
}
