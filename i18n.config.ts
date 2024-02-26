export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
        global: {
          homepage: 'Homepage',
          imprint: 'Imprint',
          privacyPolicy: 'Privacy Policy',
          seoTitle: 'Domain Checker',
          seoDescription:
            'This Domain checker is an open source project where you can check if a domain is already in use or available to buy.',
        },
        header: {
          title: 'JPP\'s Domain Checker',
          subtitle:
            'Check if your desired domain is available in seconds without ads.',
      
          checkDomain: 'Check Domain',
          openSourceRepo: 'Open Source Repository',
        },
        search: {
          headline: 'Search & Check',
          title: 'Domain Results',
          description:
            'Enter your desired domain, and we will check whether it is available or already taken.',
          form: {
            inputLabel: 'Domain Name',
            inputPlaceholder: 'Search Domains...',
            selectLabel: 'TLDs',
            selectPlaceholder: 'Select TLDs',
            selectSearchablePlaceholder: 'Search TLDs...',
            selectSelectedPlaceholder: 'Selected'
          },
        },
        result: {
          domainAvailable: 'This domain is available.',
          domainUsed: 'This domain is used and/or not available!',
        },
        modal: {
          headline: 'Redirect away?',
          title: 'External URL',
          subTitle: 'You\'re leaving this site to an external domain!',
          button: 'I understand, please redirect me'
        },
      
        notifications: {
          errorGeneral: 'Failed to check domain availability, please try again later.',
        },
      
        schema: {
          searchMin: 'Must be at least 3 characters long',
          searchRegex: 'Must be a valid domain name without TLD',
        }
      },
      
    de: {
        global: {
          homepage: 'Startseite',
          imprint: 'Impressum',
          privacyPolicy: 'Datenschutzerklärung',
          seoTitle: 'Domain Checker',
          seoDescription:
            'Dieser Domain Checker ist ein Open-Source-Projekt, mit dem du überprüfen kannst, ob eine Domain bereits verwendet wird oder zum Kauf verfügbar ist.',
        },
        header: {
          title: 'JPP\'s Domain Checker',
          subtitle:
            'Überprüfe, ob deine gewünschte Domain in Sekunden verfügbar ist, ohne Werbung.',
      
          checkDomain: 'Domain überprüfen',
          openSourceRepo: 'Open-Source-Repository',
        },
        search: {
          headline: 'Suchen & Überprüfen',
          title: 'Domain Ergebnisse',
          description:
            'Gib deine gewünschte Domain ein und wir überprüfen, ob sie verfügbar ist oder bereits vergeben wurde.',
          form: {
            inputLabel: 'Domainname',
            inputPlaceholder: 'Domains suchen...',
            selectLabel: 'TLDs',
            selectPlaceholder: 'TLDs auswählen',
            selectSearchablePlaceholder: 'TLDs suchen...',
            selectSelectedPlaceholder: 'ausgewählt'
          },
        },
        result: {
          domainAvailable: 'Diese Domain ist verfügbar.',
          domainUsed: 'Diese Domain wird verwendet und/oder ist nicht verfügbar!',
        },
        modal: {
          headline: 'Weiterleitung?',
          title: 'Externe URL',
          subTitle: 'Du verlässt diese Seite zu einer externen Domain!',
          button: 'Ich verstehe, bitte leite mich weiter'
        },
        notifications: {
          generalError: 'Fehler beim Überprüfen der Domainverfügbarkeit, bitte versuche es später erneut.',
        },
        schema: {
          searchMin: 'Muss mindestens 3 Zeichen lang sein',
          searchRegex: 'Muss ein gültiger Domainname ohne TLD sein',
        }
      },  
  },
}))
