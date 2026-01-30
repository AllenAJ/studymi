import React from 'react';
import { ArrowLeft, Shield, FileText, Sparkles, ExternalLink, Receipt } from 'lucide-react';

type LegalPageType = 'privacy' | 'terms' | 'disclaimer' | 'refund';

interface LegalPageProps {
    type: LegalPageType;
    onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
    const content = {
        privacy: {
            title: 'Privacy Policy',
            icon: Shield,
            lastUpdated: 'December 8, 2024',
            sections: [
                {
                    title: 'Introduction',
                    content: `Studymi ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered study companion application.`
                },
                {
                    title: 'Information We Collect',
                    content: `We collect information you provide directly:
• Account information (email address, name)
• Profile data (age range, study preferences, learning goals)
• Content you upload (text, PDFs, audio recordings, YouTube links)
• Study sets, flashcards, and quiz responses you create
• Feedback and communications with us

We automatically collect:
• Device and browser information
• Usage data and analytics
• Log data and IP addresses`
                },
                {
                    title: 'How We Use Your Information',
                    content: `We use your information to:
• Provide, maintain, and improve Studymi
• Generate personalized study materials using AI
• Save and sync your study sets across devices
• Communicate with you about updates and features
• Analyze usage patterns to enhance our service
• Ensure security and prevent fraud`
                },
                {
                    title: 'AI Processing',
                    content: `Your content is processed by Google's Gemini AI to generate study materials. This processing:
• Occurs in real-time when you submit content
• Is used solely to provide our service
• May be subject to Google's AI terms and policies
• Content is not used to train AI models without consent`
                },
                {
                    title: 'Data Storage and Security',
                    content: `• Your data is stored securely using Supabase infrastructure
• We implement industry-standard encryption (TLS/SSL)
• Study sets and personal data are associated with your account
• We retain data as long as your account is active
• You can request deletion of your data at any time`
                },
                {
                    title: 'Third-Party Services',
                    content: `We use the following third-party services:
• Supabase (authentication and database)
• Google Gemini AI (content generation)
• Vercel (hosting)
• YouTube (transcript fetching for video links)

These services have their own privacy policies.`
                },
                {
                    title: 'Your Rights',
                    content: `You have the right to:
• Access your personal data
• Correct inaccurate data
• Delete your account and data
• Export your study sets
• Opt out of marketing communications
• Withdraw consent at any time`
                },
                {
                    title: 'Cookies',
                    content: `We use essential cookies to:
• Maintain your login session
• Remember your preferences (dark mode, Gen Z mode)
• Enable core functionality

You can manage cookie preferences in the Settings page.`
                },
                {
                    title: 'Children\'s Privacy',
                    content: `Studymi is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.`
                },
                {
                    title: 'Changes to This Policy',
                    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.`
                },
                {
                    title: 'Contact Us',
                    content: `If you have questions about this Privacy Policy, please contact us at:
• Email: allenxavier45@gmail.com
• Website: studymi.xyz`
                }
            ]
        },
        terms: {
            title: 'Terms of Service',
            icon: FileText,
            lastUpdated: 'December 8, 2024',
            sections: [
                {
                    title: 'Agreement to Terms',
                    content: `By accessing or using Studymi, operated by POINK TECHNOLOGIES PRIVATE LIMITED ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our service.`
                },
                {
                    title: 'Description of Service',
                    content: `Studymi is an AI-powered study companion that helps users learn through the Feynman Technique. Our service includes:
• AI-generated study sets from various content types
• Flashcards, quizzes, and mind maps
• Voice recording and text input processing
• PDF and YouTube video analysis
• Teach-back practice with AI feedback`
                },
                {
                    title: 'User Accounts',
                    content: `To use Studymi, you must:
• Create an account with accurate information
• Maintain the security of your account credentials
• Be at least 13 years of age
• Not share your account with others
• Notify us immediately of any unauthorized access

We reserve the right to suspend or terminate accounts that violate these terms.`
                },
                {
                    title: 'Acceptable Use',
                    content: `You agree NOT to:
• Upload illegal, harmful, or offensive content
• Use the service for any unlawful purpose
• Attempt to reverse engineer our systems
• Interfere with or disrupt the service
• Impersonate others or misrepresent affiliation
• Use automated systems to access the service excessively
• Violate intellectual property rights of others`
                },
                {
                    title: 'Content Ownership',
                    content: `Your Content:
• You retain ownership of content you upload
• You grant us a license to process your content to provide the service
• You are responsible for ensuring you have rights to upload content

Our Content:
• Studymi branding, design, and code are our property
• AI-generated study materials are provided for your personal use
• You may not resell or redistribute generated content commercially`
                },
                {
                    title: 'AI-Generated Content',
                    content: `You acknowledge that:
• Study materials are generated by AI (Google Gemini)
• AI output may contain errors or inaccuracies
• You should verify important information independently
• AI-generated content should supplement, not replace, proper study
• We do not guarantee accuracy of generated materials`
                },
                {
                    title: 'Subscription and Billing',
                    content: `Free Tier:
• Limited features and usage quotas apply
• Subject to change at our discretion

Paid Plans (if applicable):
• Billed according to the plan you select
• Prices may change with notice
• Refunds handled on a case-by-case basis`
                },
                {
                    title: 'Limitation of Liability',
                    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:
• Studymi is provided "as is" without warranties
• We are not liable for any indirect, incidental, or consequential damages
• Our total liability shall not exceed the amount you paid us
• We do not guarantee uninterrupted or error-free service`
                },
                {
                    title: 'Indemnification',
                    content: `You agree to indemnify and hold harmless Studymi and its operators from any claims, damages, or expenses arising from:
• Your use of the service
• Your violation of these terms
• Your violation of any third-party rights
• Content you upload to the service`
                },
                {
                    title: 'Modifications to Service',
                    content: `We reserve the right to:
• Modify or discontinue any part of the service
• Change pricing and features with reasonable notice
• Update these terms at any time
• Terminate accounts that violate our policies`
                },
                {
                    title: 'Governing Law',
                    content: `These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through appropriate legal channels.`
                },
                {
                    title: 'Contact',
                    content: `For questions about these Terms of Service:
• Email: allenxavier45@gmail.com
• Website: studymi.xyz`
                }
            ]
        },
        disclaimer: {
            title: 'AI Disclaimer',
            icon: Sparkles,
            lastUpdated: 'December 8, 2024',
            sections: [
                {
                    title: 'AI-Powered Service',
                    content: `Studymi uses artificial intelligence (specifically Google's Gemini AI) to generate educational content including study summaries, flashcards, quiz questions, mind maps, and feedback on your explanations.`
                },
                {
                    title: 'Accuracy Limitations',
                    content: `IMPORTANT: AI-generated content may contain errors, inaccuracies, or outdated information.

You should:
• Always verify critical information from authoritative sources
• Use Studymi as a study aid, not a sole source of truth
• Not rely on AI-generated content for medical, legal, or financial decisions
• Cross-reference important facts before exams or professional use
• Report any significant errors you discover`
                },
                {
                    title: 'Educational Purpose Only',
                    content: `Studymi is designed for educational and study purposes only. The service:
• Is NOT a substitute for professional education
• Does NOT provide certified or accredited instruction
• Should NOT be used for official academic submissions without verification
• Is meant to assist and enhance your learning, not replace it`
                },
                {
                    title: 'Content Processing',
                    content: `When you submit content (text, PDFs, audio, video links):
• It is processed by Google Gemini AI
• The AI interprets and summarizes the content
• Generated materials are based on AI interpretation
• Original meaning may be altered or simplified
• Complex topics may be oversimplified`
                },
                {
                    title: 'No Professional Advice',
                    content: `AI-generated content from Studymi does NOT constitute:
• Medical or health advice
• Legal advice or legal opinions
• Financial or investment advice
• Professional counseling
• Official academic guidance

Always consult qualified professionals for such matters.`
                },
                {
                    title: 'Bias and Limitations',
                    content: `AI systems may exhibit:
• Biases present in training data
• Cultural or regional perspectives
• Limitations in understanding context
• Difficulty with very recent information
• Varying performance across subjects and languages

We continuously work to improve accuracy but cannot guarantee perfection.`
                },
                {
                    title: 'User Responsibility',
                    content: `By using Studymi, you acknowledge and agree that:
• You are responsible for verifying AI-generated content
• You will use the service responsibly
• You understand the limitations of AI technology
• You will not hold Studymi liable for AI inaccuracies
• You will use generated content ethically`
                },
                {
                    title: 'Continuous Improvement',
                    content: `We are committed to:
• Improving AI accuracy over time
• Updating models as better versions become available
• Listening to user feedback about errors
• Implementing safeguards against harmful content
• Being transparent about AI limitations`
                },
                {
                    title: 'Feedback and Corrections',
                    content: `If you notice inaccurate AI-generated content:
• Use the feedback feature in the app
• Email us at allenxavier45@gmail.com
• Your reports help us improve the service

We appreciate your help in making Studymi better!`
                },
                {
                    title: 'Agreement',
                    content: `By using Studymi, you confirm that you have read, understood, and agree to this AI Disclaimer. If you do not agree with these terms, please do not use our AI-powered features.`
                }
            ]
        },
        refund: {
            title: 'Refund Policy',
            icon: Receipt,
            lastUpdated: 'December 8, 2024',
            sections: [
                {
                    title: 'Subscription Cancellations',
                    content: `You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period. You will continue to have access to paid features until the end of your billing cycle.`
                },
                {
                    title: 'Refund Eligibility',
                    content: `We offer refunds in the following specific cases:
• Technical Issues: If the service was unusable due to technical faults on our end.
• Accidental Purchase: If you contact us within 24 hours of the initial subscription purchase.
• Duplicate Charges: If you were billed multiple times for the same period.

We generally do NOT provide refunds for:
• Change of mind
• Unused subscription time
• Failure to cancel before renewal`
                },
                {
                    title: 'How to Request a Refund',
                    content: `To request a refund, please contact our support team at:
• Email: allenxavier45@gmail.com
• Subject: Refund Request - [Your Email]

Please include your transaction ID or the email address used for the account.`
                },
                {
                    title: 'Processing Time',
                    content: `Refund requests are reviewed within 3-5 business days. If approved, the refund will be processed to your original payment method. Depending on your bank, it may take an additional 5-10 business days for the funds to appear in your account.`
                },
                {
                    title: 'Contact Us',
                    content: `POINK TECHNOLOGIES PRIVATE LIMITED
Email: allenxavier45@gmail.com`
                }
            ]
        }
    };

    const page = content[type];
    const Icon = page.icon;

    return (
        <div className="min-h-screen bg-iceGray dark:bg-darkBg font-sans text-deepNavy dark:text-darkText transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 dark:bg-darkBg/80 backdrop-blur-lg border-b border-softBorder dark:border-darkBorder z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-none hover:bg-iceGray dark:hover:bg-darkCard transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-primaryGold/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primaryGold" />
                        </div>
                        <h1 className="text-xl font-bold dark:text-white">{page.title}</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-darkCard rounded-none p-8 md:p-12 border border-softBorder dark:border-darkBorder shadow-soft">

                    {/* Last Updated */}
                    <p className="text-sm text-steelGray dark:text-darkMuted mb-8">
                        Last updated: {page.lastUpdated}
                    </p>

                    {/* Sections */}
                    <div className="space-y-10">
                        {page.sections.map((section, index) => (
                            <section key={index}>
                                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                                    <span className="text-primaryGold">§{index + 1}</span>
                                    {section.title}
                                </h2>
                                <div className="text-deepNavy/80 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Navigation between legal pages */}
                    <div className="mt-12 pt-8 border-t border-softBorder dark:border-darkBorder">
                        <h3 className="text-sm font-bold text-steelGray dark:text-darkMuted mb-4 uppercase tracking-wide">
                            Other Legal Documents
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {type !== 'privacy' && (
                                <a href="/privacy" className="flex items-center gap-2 px-4 py-2 bg-iceGray dark:bg-darkBorder rounded-none text-sm font-medium hover:bg-softBorder dark:hover:bg-darkBorder/80 transition-colors">
                                    <Shield className="w-4 h-4" />
                                    Privacy Policy
                                </a>
                            )}
                            {type !== 'terms' && (
                                <a href="/terms" className="flex items-center gap-2 px-4 py-2 bg-iceGray dark:bg-darkBorder rounded-none text-sm font-medium hover:bg-softBorder dark:hover:bg-darkBorder/80 transition-colors">
                                    <FileText className="w-4 h-4" />
                                    Terms of Service
                                </a>
                            )}
                            {type !== 'disclaimer' && (
                                <a href="/disclaimer" className="flex items-center gap-2 px-4 py-2 bg-iceGray dark:bg-darkBorder rounded-none text-sm font-medium hover:bg-softBorder dark:hover:bg-darkBorder/80 transition-colors">
                                    <Sparkles className="w-4 h-4" />
                                    AI Disclaimer
                                </a>
                            )}
                            {type !== 'refund' && (
                                <a href="/refund" className="flex items-center gap-2 px-4 py-2 bg-iceGray dark:bg-darkBorder rounded-none text-sm font-medium hover:bg-softBorder dark:hover:bg-darkBorder/80 transition-colors">
                                    <Receipt className="w-4 h-4" />
                                    Refund Policy
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Back to app */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-deepNavy dark:bg-white text-white dark:text-deepNavy font-bold rounded-none hover:opacity-90 transition-opacity"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Studymi
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-steelGray dark:text-darkMuted">
                <p>© 2024 Studymi. All rights reserved.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <a href="/privacy" className="hover:text-deepNavy dark:hover:text-white transition-colors">Privacy</a>
                    <span>•</span>
                    <a href="/terms" className="hover:text-deepNavy dark:hover:text-white transition-colors">Terms</a>
                    <span>•</span>
                    <a href="/terms" className="hover:text-deepNavy dark:hover:text-white transition-colors">Terms</a>
                    <span>•</span>
                    <a href="/disclaimer" className="hover:text-deepNavy dark:hover:text-white transition-colors">AI Disclaimer</a>
                    <span>•</span>
                    <a href="/refund" className="hover:text-deepNavy dark:hover:text-white transition-colors">Refund Policy</a>
                </div>
            </footer>
        </div>
    );
};
