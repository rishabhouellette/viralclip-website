// ─────────────────────────────────────────────────────────────────
// services/aiEngagementService.js — Mock comments, DMs, AI replies
// ─────────────────────────────────────────────────────────────────

const MOCK_COMMENTS = [
  { id: 'c1', author: '@fitnessjunkie', text: 'How did you do this?', time: '2h ago', platform: 'Instagram' },
  { id: 'c2', author: '@techbro99', text: 'This is exactly what I needed!', time: '4h ago', platform: 'TikTok' },
  { id: 'c3', author: '@sarahcreates', text: 'Can you make a tutorial on this?', time: '6h ago', platform: 'YouTube' },
  { id: 'c4', author: '@growthmike', text: 'Saved this for later 🔥', time: '8h ago', platform: 'TikTok' },
  { id: 'c5', author: '@digitalwiz', text: 'What tools do you use?', time: '12h ago', platform: 'Instagram' },
];

const MOCK_DMS = [
  { id: 'd1', author: '@contentqueen', text: 'Hey! Love your content. Can we collab?', time: '1h ago', platform: 'Instagram' },
  { id: 'd2', author: '@startupfounder', text: 'Would you be interested in a sponsorship?', time: '3h ago', platform: 'TikTok' },
  { id: 'd3', author: '@newcreator', text: 'How do you edit your videos so fast?', time: '5h ago', platform: 'Instagram' },
];

const REPLY_TEMPLATES = {
  question: [
    "Great question! I'll cover this in an upcoming video 👀",
    "Glad you asked! I'll share a detailed breakdown soon 🔥",
    "Thanks for asking! Short answer: consistency + the right tools."
  ],
  praise: [
    "Thank you so much! More coming soon 🙏",
    "Glad you liked it! I'll share more soon 👀",
    "Appreciate the love! Stay tuned for more 🚀"
  ],
  request: [
    "Great idea! I'll add it to my content list 📋",
    "Definitely planning to make that! Subscribe to not miss it ✨",
    "Love the suggestion — it's on my list!"
  ],
  collab: [
    "Hey! Thanks for reaching out. Let's discuss — I'm open to collabs! 🤝",
    "Love your content too! Let's connect and brainstorm something 💡"
  ],
  generic: [
    "Thanks for the message! I really appreciate it 🙏",
    "Thanks for reaching out! I'll get back to you soon."
  ]
};

class AiEngagementService {
  /**
   * Get mock comments.
   * @returns {Array}
   */
  getComments() {
    return MOCK_COMMENTS;
  }

  /**
   * Get mock DMs.
   * @returns {Array}
   */
  getDMs() {
    return MOCK_DMS;
  }

  /**
   * Generate a contextual AI reply for a given comment/DM text.
   * @param {string} text
   * @returns {string}
   */
  generateReply(text) {
    const lower = text.toLowerCase();
    let category = 'generic';

    if (lower.includes('?') || lower.includes('how') || lower.includes('what') || lower.includes('why')) {
      category = 'question';
    } else if (lower.includes('love') || lower.includes('great') || lower.includes('amazing') || lower.includes('🔥') || lower.includes('saved')) {
      category = 'praise';
    } else if (lower.includes('tutorial') || lower.includes('make') || lower.includes('can you')) {
      category = 'request';
    } else if (lower.includes('collab') || lower.includes('sponsorship') || lower.includes('partner')) {
      category = 'collab';
    }

    const options = REPLY_TEMPLATES[category];
    return options[Math.floor(Math.random() * options.length)];
  }
}

export const aiEngagementService = new AiEngagementService();
