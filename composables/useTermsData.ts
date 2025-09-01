export interface TermSection {
  id: number
  title: string
  content: string
}

export const useTermsData = () => {
  const termsSections: TermSection[] = [
    {
      id: 1,
      title: '1. Introduction',
      content:
        "Welcome to OpenProperty and UmovingU. These Terms of Business ('Terms') govern your use of our websites, mobile applications, and related services (collectively, 'Services'). By using our Services, you agree to be bound by these Terms.",
    },
    {
      id: 2,
      title: '2. Our Services',
      content:
        'OpenProperty provides digital infrastructure and tools for managing, sharing, and securing property-related data. Umovingu is a consumer-focused application that helps users prepare their property journeys, including property passports, document storage, task tracking, and onboarding to a more transparent transaction process.',
    },
    {
      id: 3,
      title: '3. Who Can Use Our Services',
      content:
        'To use our Services, you must: Be at least 18 years old. Use the Services for lawful purposes only. Not represent yourself as someone else or act fraudulently. We reserve the right to suspend or terminate accounts that breach these Terms.',
    },
    {
      id: 4,
      title: '4. Registration and Account',
      content:
        'You may need to register for an account to access certain features. You agree to: Provide accurate, current, and complete information. Maintain the confidentiality of your login credentials. Notify us immediately of any unauthorised use of your account.',
    },
    {
      id: 5,
      title: '5. User Responsibilities',
      content:
        'You agree not to: Upload false or misleading information. Misuse any part of the platform, including blockchain or secure document sharing. Attempt to reverse-engineer, damage, or disrupt the platform. You are solely responsible for the content you input or store, including documents, property details, or contact information.',
    },
    {
      id: 6,
      title: '6. Fees and Payments (If Applicable)',
      content:
        'If you choose to use paid services, fees will be clearly indicated before purchase. All payments are processed securely via third-party providers. You agree that: Payments are non-refundable unless stated otherwise. Subscription services (if any) renew automatically unless cancelled prior to renewal.',
    },
    {
      id: 7,
      title: '7. Data and Privacy',
      content:
        'Your data is stored securely and processed in accordance with our Privacy Policy. OpenProperty uses encrypted and decentralised technologies to safeguard your documents and transaction trail. By using our Services, you consent to: Secure storage of property-related documents. Controlled data sharing with authorised parties (e.g., legal representatives, agents) with your explicit consent.',
    },
    {
      id: 8,
      title: '8. Blockchain and Data Trust Layer',
      content:
        'OpenProperty may use blockchain infrastructure to verify and timestamp documents. You acknowledge: Blockchain records are immutable once written. You control who can access and verify your data using mutual authentication protocols.',
    },
    {
      id: 9,
      title: '9. Third Parties',
      content:
        'We may partner with estate agents, solicitors, surveyors, and other service providers. While we facilitate these connections: We do not act as an estate agent, legal advisor, or financial intermediary. You are responsible for your engagements with any third-party service.',
    },
    {
      id: 10,
      title: '10. Intellectual Property',
      content:
        'All intellectual property rights in the Services (including logos, software, branding, and content) belong to OpenProperty Ltd or its licensors. You may not: Copy, modify, or distribute our software or branding. Use our name, trademarks, or other brand elements without written permission.',
    },
    {
      id: 11,
      title: '11. Limitation of Liability',
      content:
        'To the extent permitted by law: We are not liable for any loss or damage resulting from your use of our Services. We do not guarantee that our Services will be error-free, timely, or meet all your expectations.',
    },
    {
      id: 12,
      title: '12. Termination',
      content:
        'We may suspend or terminate your access to the Services if: You breach these Terms. We are required to do so by law or for operational reasons. You may delete your account at any time through the platform.',
    },
    {
      id: 13,
      title: '13. Changes to These Terms',
      content:
        'We may update these Terms from time to time. Significant changes will be notified through email or in-app alerts. Your continued use after changes are posted constitutes acceptance of the updated Terms.',
    },
    {
      id: 14,
      title: '14. Governing Law',
      content:
        'These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.',
    },
  ]

  return {
    termsSections,
  }
}
