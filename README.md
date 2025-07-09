# <img src="/assets/Logo.png" alt="Logo" width="25">  Hungry on the go? - Yumigo <img src="/assets/Logo.png" alt="Logo" width="25">

---
## Dokumentation
### 8. Juli 2025 | Projektteam: Serra-Naz Akin, Selina Mogicato, Timea Portmann

---

# 📑 Inhalt

1. [Einleitung](#1--einleitung)
2. [Abstract](#2--abstract)
3. [Benutzung der App](#3--benutzung-der-app)
4. [User Stories](#4--user-stories)
5. [Mockups](#5--mockups)
   - [App Icon](#51--app-icon)
   - [Homescreen und Rezeptedetailseite](#52--homescreen-und-rezeptedetailseite)
   - [Craving und Cravingresultsseite](#53--craving-und-cravingresultsseite)
   - [Createform](#54--createform)
   - [Profilescreen](#55--profilescreen)
   - [Favoritesscreen](#56--favoritesscreen)
6. [Technische Realisierung](#6--technische-realisierung)
7. [Testing](#7--testing)
8. [Testprotokoll](#8--testprotokoll)
9. [Übersicht unseren automatisierten Tests](#9--übersicht-unseren-automatisierten-tests)
   - [Authentifizierung Tests](#91--authentifizierung-tests)
   - [Rezeptmanagement Tests](#92--rezeptmanagement-tests)
   - [UI Komponenten Tests](#93--ui-komponenten-tests)
   - [Utilities & Constants Tests](#94--utilities-&-constants-tests)
   - [Hooks & Features Tests](#95--hooks-&-features-tests)
10. [Fazit](#10--fazit)

---

# 1. 📝 Einleitung

Dies ist die Projektdokumentation zur mobile App **Yumigo**. Das Projekt wurde im Rahmen des Überbetrieblichen Kurses
 335 Mobile App umgesetzt und dauerte insgesamt 7 Tage. Ziel war es, eine Mobile App zu entwickeln, mit der Nutzer ihre Rezepte verwalten und nach Vorlieben filtern können. 

---

# 2. 📄 Abstract

Yumigo ist eine mobile Applikation, die Nutzer:innen dabei unterstützt, ihre aktuellen „Cravings“, also Gelüste oder spontane Essenswünsche, einzugeben und darauf basierend passende Rezepte zu entdecken. Der Fokus liegt auf intuitiver Navigation durch Kategorien, saisonaler Relevanz sowie einer nutzerzentrierten Rezeptentdeckung.

### Zielgruppe

- Menschen, die sich bewusst ernähren möchten
- Nutzer:innen, die sich gerne inspirieren lassen
- Personen mit spontanen Essensgelüsten ohne konkrete Rezeptideen
- Menschen, die saisonal und lokal einkaufen möchten

### Projektumfang

### Hauptmodule

- **Craving-Eingabe-Modul**
  - Visuelle Darstellung der Craving-Kategorien (z.B. „etwas Warmes“, „etwas Süsses“)

- **Rezept-Browser**
  - Darstellung und Suche von Rezepten basierend auf Cravings

- **Rezeptdetail-Seite**
  - Mit Zutaten, Bildern, Zubereitungsanleitung

- **Favoritenverwaltung**

###  Zusatzfunktionen (optional)

- **Rezeptbewertung**

- **Teilen-Funktion für Rezepte**

- **Einkaufslisten-Feature**

- **Personalisierte Craving-Vorschläge**
  - Durch Analyse des Nutzungsverhaltens

- **Standort- und Saisonfilter**
  - Dynamische Filterung von Rezepten basierend auf Standortdaten und saisonalen Verfügbarkeiten

- **AI-Einbindung (zukünftig, privat)**
  - Scanning des Kühlschrankinhalts oder allgemein von Lebensmitteln
  - Rezeptvorschläge basierend auf vorhandenen Zutaten

- **Eigenes Profil teilen können** *(zukünftig, privat)*

- **Nachrichtenfunktion zwischen App-Usern** *(zukünftig, privat)*
  - Rezepte direkt über die App in einem Chat senden


---

# 3. 📱 Benutzung der App

Nach dem Öffnen der Yumigo-App startet der Nutzer auf einer Login- oder Registrierungsseite.

**Schritte im Alltag:**

1. Registrierung eines neuen Benutzerkontos oder Login mit bestehenden Zugangsdaten.
2. Auf dem **Homescreen** erhält man eine Übersicht über aktuelle und empfohlene Rezepte. 
3. Im **Craving-Eingabe-Modul** kann man spontan seine Gelüste (z.B. „etwas Warmes“ oder „etwas Süsses“) eingeben und passende Rezeptvorschläge erhalten.
4. Im **Rezept-Browser lassen** sich Rezepte nach Kategorien, saisonalen Zutaten und Standort filtern sowie durchsuchen.
5. Auf der **Rezeptdetail-Seite** können Zutaten, Zubereitungsanleitungen und Bilder angesehen werden. Ausserdem kann man Rezepte zu den Favoriten hinzufügen.
6. Im Header des **Homescreens** können Nutzer eigene Rezepte erstellen und bearbeiten.
7. Auf der **Profile** Seite kann sieht man seine Follower und seinen Gefolgten, man sieht alle seine eigenen erstellten Rezepte.
8. Die Nutzeroberfläche lässt sich per Einstellung zwischen **Dark- und Lightmode** wechseln.

💡 Ein JWT wird im Hintergrund verwaltet, dadurch bleiben Benutzer auch nach einem Seitenreload eingeloggt.

---
# 4. 🎯️ User Stories

Zu Beginn unseres Projektes haben wir sogenannte User Stories geschrieben, um unsere Anforderungen im Auge zu behalten.

**🔗 Was ist eine User Story? / Wie schreibe ich diese?**  
[Mehr Infos hier](https://de.wikipedia.org/wiki/User-Story)

- User Stories werden in der **Business-Sprache** verfasst (vermeide technische Begriffe).
- Die User Stories sind **priorisiert**, vom Wichtigen zum Unwichtigen.
- Schreibe die User Stories in der **abzuarbeitenden Reihenfolge**:

### 🍽️ Cravings & Rezeptvorschläge

| **ID** | **Beschreibung**                                                                                                             | **Erreicht?** |
|--------|------------------------------------------------------------------------------------------------------------------------------|---------------|
| C-01   | Als Nutzer:in möchte ich ein Craving angeben können, damit ich passende Rezeptideen bekomme.                                 | ✅             |
| C-02   | Als Nutzer:in möchte ich Rezepte nach Kategorien durchstöbern, um inspiriert zu werden.                                      | ✅             |
| C-03   | Als Nutzer:in möchte ich Rezepte nach saisonalen Zutaten filtern, um nachhaltiger zu kochen.                                 | ✅             |
| C-04   | Als Nutzer:in möchte ich die Details eines Rezepts ansehen können (Zutaten, Anleitung, etc.).                                | ✅             |

### 📚 Rezeptverwaltung & Favoriten

| **ID** | **Beschreibung**                                                                                                                              | **Erreicht?** |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| R-01   | Als Nutzer:in möchte ich eigene Rezepte erstellen, bearbeiten und löschen können, damit ich meine Inspiration mit den anderen teilen kann.   | ✅             |
| R-02   | Als Nutzer:in möchte ich Rezepte zu meinen Favoriten hinzufügen können.                                                                       | ✅             |

### 👤 Profil & Community

| **ID** | **Beschreibung**                                                                                                   | **Erreicht?** |
|--------|--------------------------------------------------------------------------------------------------------------------|---------------|
| P-01   | Als Nutzer:in möchte ich Personen folgen können.                                                                   | ✅             |
| P-02   | Als Nutzer:in möchte ich ein persönliches Profil haben, in dem ich meine hochgeladenen Rezepte sehen kann.        | ✅             |

### 💡 Optionale User Stories

| **ID** | **Beschreibung**                                                                                                                                    | **Erreicht?** |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| O-01   | Als Nutzer:in möchte ich meine Lieblingsrezepte bewerten können.                                                                                    | ✅             |
| O-02   | Als Nutzer:in möchte ich Rezepte mit Freunden teilen können.                                                                                        | ✅             |
| O-03   | Als Nutzer:in möchte ich eine Einkaufsliste aus einem Rezept erstellen können, um meinen nächsten Einkauf optional planen zu können.                | ✅             |
| O-04   | Als Nutzer:in möchte ich meinen Standort teilen, damit mir saisonale Rezepte aus meiner Region angezeigt werden.                                    | ✅ & ❌          |
| O-05   | Als Nutzer:in möchte ich ein Bild von meinem Kühlschrank oder meinen Vorräten fotografieren können, damit eine AI passende Rezepte vorschlägt.     | ❌             |
| O-06   | Als Nutzer:in möchte ich mein Profil über einen Share-Button (z.B. über WhatsApp oder Instagram) teilen können.                                     | ✅             |
| O-07   | Als Nutzer:in möchte ich direkt in der Yumigo-App meine Rezepte über einen Chat teilen können.                                                      | ✅             |
| O-08   | Als Nutzer:in möchte ich private Nachrichten an andere Nutzer:innen senden können, um mich über Rezepte und Cravings austauschen zu können.         | ❌             |


---

# 5. 🎨 Mockups

## 5.1 App Icon
Unser Logo besteht aus einer Zunge für unsere Rezepte App und einem Y für Yumigo.

![appIconMockup.png](assets/appIconMockup.png)

---
## 5.2 Homescreen und Rezeptedetailseite
Oben links im Header haben wir unser Logo platziert und oben rechts einen Add-Butto, wo man ein neues Rezept hinzufügen kann. Ebenfals haben wir oben rechts eine Glocke für die Notifications gemacht. 

Unter dem Header kommt eine Searchbar, um nach Rezepten zu suchen und zu filtern. 
Unterhalb von der Searchbar kommen alle Rezepte angezeigt. 

Ganz unten haben wir unsere Bottomnavigation mit den Tabs Home, Craving, Favorite und Profile. Wenn man auf ein einzelnes Rezept klickt kommt man auf die Rezeptedetailseite. 

Auf der Rezeptedetailseite sieht man alle Zutaten, eine Beschreibung des Gerichtes, die Vorbereitungsschritte. Ebenfalls hat man die Möglichkeit das Rezept zu Liken, zu speichern unter seinen Favoriten und man kann das Rezept mir Freunden direkt in einem Chat, wie Whatsapp, sharen. 

![Homescreen Mockup.png](assets/Homescreen%20Mockup.png)

---

## 5.3 Craving und Cravingresultsseite

Auf dem Cravingscreen kann der Nutzer auswählen, worauf er aktuell Appetit hat. Zur Auswahl stehen sechs Geschmacksrichtungen: Salty, Sweet, Sour, Spicy, Cold und Hot. Jede Kategorie ist als eigene Kachel mit einem passenden Emoji dargestellt. Sobald man eine dieser Kategorien antippt, wird man zum Cravingdetailscreen weitergeleitet.

Der Cravingdetailscreen zeigt passende Rezepte zur gewählten Kategorie an, in diesem Beispiel „Salty Recipes“. Zuoberst befindet sich ein Titel mit einer kurzen Beschreibung. Darunter werden die Rezeptvorschläge in einer Liste angezeigt, jeweils mit Titel, Bewertungssternen, einem Bild und einer Followoption.

Ganz unten befindet sich wieder unsere Bottom Navigation Bar, mit den vier Tabs: Home, Craving, Favorite und Profile, über die man jederzeit zwischen den Hauptbereichen der App wechseln kann.

![Craving Mockup .png](assets/Craving%20Mockup%20.png)

---

## 5.4 Createform
Auf dem Createrecipescreen kann der Nutzer ein neues Rezept anlegen. Zuoberst gibt es die Möglichkeit, ein Foto hochzuladen. Darunter befinden sich Eingabefelder für den Rezepttitel, eine Beschreibung und die Kategorie (Salty, Sweet, Spicy, ect.).

Scrollt man weiter nach unten, können Zutaten mit Menge und Einheit hinzugefügt werden. Ausserdem gibt es ein Feld für die Zubereitungsschritte. Unten am Screen befindet sich ein Button, um das Rezept zu veröffentlichen.

Auch hier ist die Bottom Navigation Bar mit den Tabs Home, Craving, Favorite und Profile jederzeit sichtbar.

![Createform Mockup.png](assets/Createform%20Mockup.png)


---
## 5.5 Profilescreen

Auf dem Profilescreen sieht man alle Infos zum eigenen Nutzerkonto. Oben werden Profilbild, Username, Follower- und Following-Anzahl sowie die Anzahl der eigenen Rezepte angezeigt. Darunter gibt es eine kurze Beschreibung.

Man hat die Möglichkeit, das Profil zu bearbeiten oder den Link zum Profil zu teilen. Unter dem Bereich „Your Recipes“ werden alle eigenen Rezepte als Karten aufgelistet.

Unten befindet sich die Bottom Navigation Bar mit den Tabs Home, Craving, Favorites und Profile.

![ProfileScreen Mockup.png](assets/ProfileScreen%20Mockup.png)

--- 
## 5.6 Favoritesscreen
Im Favoritesscreen werden alle gespeicherten Lieblingsrezepte angezeigt. Oben gibt es eine Searchbar, um nach Favoriten zu suchen oder nach Kategorien wie Sweet, Salty oder Spicy zu filtern.

Darunter sind die Favoriten als Liste dargestellt. Jedes Rezept zeigt Titel, Bild, Bewertung, Icons zum Speichern, Liken oder Teilen und einen Follow-Button für den Rezept-Ersteller.

Ganz unten ist wie immer die Bottom Navigation Bar mit den Tabs Home, Craving, Favorites und Profile.

![Favorite Mockup.png](assets/Favorite%20Mockup.png)

---

# 6. ⚙️ Technische Realisierung

## Komponentenübersicht
### Frontend (React Native):

Screens: Die App ist in verschiedene Screens unterteilt (Home, Craving, Favorites, Profile, etc.), die jeweils als eigene Komponenten im app-Verzeichnis liegen.
Komponenten: Wiederverwendbare Komponenten wie RecipeCard, SearchBar, FollowButton und Modals befinden sich im components Ordner.
Hooks & Contexts: Eigene React Hooks (useFavorites, useFollow, etc.) und Contexts (ThemeContext, NotificationContext) sorgen für State Management und globale Zustände.
Navigation: Die Navigation erfolgt über das Expo Router System und React Navigation.


### Backend (Firebase):

Firestore: Speicherung aller Rezepte, Userdaten, Likes, Kommentare, etc.
Authentication: Nutzerverwaltung und Authentifizierung via Firebase Auth.
Push Notifications: Versand von Benachrichtigungen über Firebase.

### Utilities:

Saisonale Zutaten: Im Verzeichnis ingredients.json sind alle Zutaten mit Saisondaten für verschiedene Länder hinterlegt. Die Logik zur Filterung nach saisonalen Zutaten ist in seasonalUtils.js implementiert.
Personalisierung: Die Feed Ranking Logik berücksichtigt Nutzerpräferenzen, Engagement und Saisonalität.

## Datenfluss & Abläufe

### Rezept-Feed:

Rezepte werden aus Firestore geladen und lokal im State gespeichert.
Die Feed-Logik (home.js) filtert und sortiert Rezepte nach Engagement, Aktualität, Trending, Saisonalität und Nutzerpräferenzen.
Ein Pull-to-Refresh Mechanismus sorgt für aktuelle Daten ohne App-Neustart.
### Saisonfilter:

Nutzer können Rezepte nach saisonalen Zutaten filtern. Die App erkennt dabei auch Pluralformen von Zutaten.
Die aktuelle Saison wird dynamisch anhand des Monats und des Nutzerstandorts bestimmt.
Personalisierung:

Der Feed wird für jeden Nutzer individuell gewichtet: Likes, gespeicherte Zutaten, bevorzugte Küchen und Ernährungsweisen fliessen in das Ranking ein.
Ein Algorithmus mit anpassbaren Gewichtungen sorgt für eine dynamische, personalisierte Reihenfolge der Rezepte.

---

# 7. 📌 Testing

### Testfall: Craving eingeben

| **ID**            | T-C01                                                                 |
|-------------------|------------------------------------------------------------------------|
| **Anforderungen** | C-01 (Craving angeben)                                                 |
| **Ablauf**        | Nutzer:in gibt das Craving „etwas Warmes“ über das Interface ein.     |
| **Erwartet**      | Passende Rezeptideen erscheinen auf Basis der Auswahl „etwas Warmes“. |

### Testfall: Rezept erstellen, bearbeiten, löschen

| **ID**            | T-R01                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------|
| **Anforderungen** | R-01 (Rezeptverwaltung)                                                                                 |
| **Ablauf**        | Nutzer:in erstellt ein Rezept „Gemüsesuppe“, bearbeitet die Zutatenliste und löscht das Rezept wieder. |
| **Erwartet**      | Rezept wird erfolgreich gespeichert, Änderungen übernommen und anschliessend gelöscht.                   |

### Testfall: Rezepte nach Kategorien durchsuchen

| **ID**            | T-C02                                                                             |
|-------------------|------------------------------------------------------------------------------------|
| **Anforderungen** | C-02 (Rezepte nach Kategorien)                                                    |
| **Ablauf**        | Nutzer:in wählt in der Kategorieübersicht „etwas Süsses“.                         |
| **Erwartet**      | Es werden nur Rezepte angezeigt, die der Kategorie „etwas Süsses“ zugeordnet sind. |

### Testfall: Saisonfilter aktivieren

| **ID**            | T-C03                                                                                  |
|-------------------|----------------------------------------------------------------------------------------|
| **Anforderungen** | C-03 (Saisonale Zutaten filtern)                                                       |
| **Ablauf**        | Nutzer:in aktiviert den Saisonfilter.                                                  |
| **Erwartet**      | Nur Rezepte mit saisonal verfügbaren Zutaten (z.B. Spargel, Erdbeeren) werden gezeigt. |

### Testfall: Rezeptdetailseite aufrufen

| **ID**            | T-C04                                                                   |
|-------------------|-------------------------------------------------------------------------|
| **Anforderungen** | C-04 (Rezeptdetails anzeigen)                                           |
| **Ablauf**        | Nutzer:in klickt auf das Rezept „Garlic Parmesan Popcorn“.              |
| **Erwartet**      | Detailansicht mit Zutatenliste, Bildern und Zubereitung wird angezeigt. |

### Testfall: Rezept favorisieren

| **ID**            | T-R02                                                                                                  |
|-------------------|--------------------------------------------------------------------------------------------------------|
| **Anforderungen** | R-02 (Rezepte favorisieren)                                                                            |
| **Ablauf**        | Nutzer:in klickt auf das Speichernsymbol beim Rezept „Garlic Parmesan Popcorn“.                        |
| **Erwartet**      | Rezept „Garlic Parmesan Popcorn“ wird als Favorit gespeichert und ist auf der Favoritenseite sichtbar. |

### Testfall: Person folgen

| **ID**            | T-P01                                                              |
|-------------------|--------------------------------------------------------------------|
| **Anforderungen** | P-01 (Personen folgen)                                             |
| **Ablauf**        | Nutzer:in klickt im Profil von „Florin Furter“ auf „Follow“.       |
| **Erwartet**      | Florin Furter wird in der „Following“ Liste des Nutzers angezeigt. |

### Testfall: Profil & eigene Rezepte anzeigen

| **ID**            | T-P02                                                       |
|-------------------|-------------------------------------------------------------|
| **Anforderungen** | P-02 (Eigenes Profil einsehen)                              |
| **Ablauf**        | Nutzer:in öffnet den Tab „Profil“ in der Navigationsleiste. |
| **Erwartet**      | Alle eigenen hochgeladenen Rezepte sind dort sichtbar.      |


---

# 8. 📑 Testprotokoll

| **ID** | **Erfolgreich** | **Wer?** | **Datum und Uhrzeit** |
|--------|---------------|----------|-----------------------|
| T-C01  | ✅             | Florent  | 30.6.2025, 14:03 Uhr  |
| T-R01   | ✅             | León     | 30.6.2025, 14:10 Uhr  |
|T-C02  | ✅             | Lysandro | 30.6.2025, 14:18 Uhr  |
| T-C03  | ✅             | Mateo    | 30.6.2025, 14:35 Uhr  |
| T-C04   | ✅             | Florent  | 30.6.2025, 15:07 Uhr  |
| T-R02   | ✅             | Lysandro | 30.6.2025, 15:33 Uhr  |
| T-P01  | ✅             | León     | 30.6.2025, 15:45 Uhr  |
| T-P02    | ✅             | Mäx      | 01.7.2025, 9:30 Uhr   |


---
# 9. 📌 Übersicht unseren automatisierten Tests

Wir haben eine umfassende Test-Suite entwickelt, die verschiedene Aspekte der Yumigo-App abdeckt. Hier ist eine detaillierte Übersicht:

Die Tests können laufengelassen werden, wenn man in der Konsole **npm test** eingibt und Enter drückt. 

## 9.1 🔐 Authentifizierung Tests
___
authService.test.js

#### Was getestet wird:

- Login-Funktionalität mit Firebase Auth
- Benutzerregistrierung und Email-Verifizierung
- Logout-Prozess
- Password-Validierung (starke vs. schwache Passwörter)
- Email-Format-Validierung
- Fehlerbehandlung für verschiedene Auth-Szenarien

#### Test-Abdeckung:
- Erfolgreicher Login mit gültigen Credentials
- Fehlerbehandlung bei ungültigen Credentials
- Registrierung neuer Benutzer
- Behandlung bereits existierender E-Mails
- Password-Stärke-Validierung

___

authHelpers.test.js

#### Was getestet wird:
- requireAuth(), Überprüfung ob User eingeloggt ist
- showAuthError(), Anzeige von Auth-Fehlern
- Alert-Funktionalität für Login-Anforderungen

#### Test-Abdeckung:
- Rückgabe true bei eingeloggtem User
- Alert-Anzeige und false-Rückgabe bei nicht eingeloggtem User
- Standardtexte für verschiedene Aktionen
- Errorlogging in Console

--- 

## 9.2 📝 Rezeptmanagement Tests
recipeService.test.js

### Was getestet wird:
- Firebase Firestoreintegration für Rezepte
- getRecipe(), Abrufen einzelner Rezepte
- Datenvalidierung für Rezept-Strukturen
- Fehlerbehandlung bei Firebaseoperationen

### Test-Abdeckung:
- Erfolgreiches Laden existierender Rezepte
- Rückgabe null für nicht existierende Rezepte
- Firebaseerrorhandling
- Validierung der Rezeptdatenstruktur
- Zeitbereichvalidierung (1-15 Minuten)
- Zutatenarrayvalidierung

---

validation.test.js

### Was getestet wird:
- validateRecipe(), Umfassende Rezeptvalidierung
- Validierung aller Rezeptfelder (Titel, Beschreibung, Zeit, etc.)
- Edge Cases und Performancetests

### Test-Abdeckung:
- Gültige Rezepte werden akzeptiert
- Titellängevalidierung (mindestens 3 Zeichen)
- Beschreibungslängevalidierung
- Kochzeitbereich (1-15 Minuten)
- Kategorienarray (nicht leer)
- Zutatenstruktur mit Menge und Name
- Anweisungenarray
- Sonderzeichenbehandlung
- Performance bei grossen Arrays
- Null/Undefined Behandlung

--- 

# 9.3 🎨 UI Komponenten Tests
SearchBar.test.js

### Was getestet wird:
- Renderverhalten der Suchleiste
- Texteingabe und onSearch-Callback
- Placeholderanzeige
- Focus/Blur Verhalten

### Test-Abdeckung:
- Korrekte Render mit Placeholder
- onSearch-Callback bei Texteingabe
- Styling Eigenschaften
- Leere Eingaben
- Funktion ohne onSearch-Callback
- Sonderzeichen Verarbeitung

___

RecipeCard.test.js & FollowButton.test.js

### Was getestet wird:
- Basis Komponenten Existenz
- Einfache UI-Logic Tests

### Test-Abdeckung:
- Komponenten Definition
- Basis Funktionalität (Toggle-Logic für FollowButton)

--- 

# 9.4 🔧 Utilities & Constants Tests
constants.test.js

### Was getestet wird:
- App Konstanten (Kategorien, Allergene, Ernährungsformen)
- Datenstruktur Validierung
- Farbcode Validierung

### Test-Abdeckung:
- CATEGORIES: Vollständigkeit, Eindeutigkeit, Hex Farben
- ALLERGENS: Wichtige Allergene, Datenstruktur
- DIETARY: Ernährungsformenvalidierung
- COLORS: Primärfarben, Hexcodevalidierung

--- 

# 9.5 📱 Hooks & Features Tests
useFavorites.test.js

### Was getestet wird:
- Favoritenmanagementlogic
- Arrayoperationen für Favoriten

### Test-Abdeckung:
- Hinzufügen/Entfernen von Favoriten
- Favoritenstatusüberprüfung
- Arraymanagement

---
login.test.js

### Was getestet wird:
- Loginscreenbasisfunktionalität
- Stringvalidierung für Email/Password

---

# 10. 🏁 Fazit

### ✅ Was lief gut?

- Unser gesamtes Projekt lief sehr gut, wir hatten eine klare Struktur, eine effiziente Zeiteinteilung und eine gute Kommunikation im Team.
- Die Aufteilung in React-Komponenten half dabei, schneller und strukturierter zu arbeiten.
- Die Verbindung von Firebase (Backend) mit dem Frontend funktionierte nach der Einrichtung reibungslos.
- Das Projekt war sauber aufgebaut, was allen im Team half, den Überblick zu behalten.
- Wir arbeiteten mit einem klaren Git-Flow auf separaten Branches, dadurch konnten viele Mergekonflikte vermieden werden.

---

### ❌ Herausforderungen

- Die Implementierung von Login und Registrierung war anfangs schwierig, die Konfigurationen von Firebase haben nicht direkt funktioniert, was viel Zeit gekostet hat.
- Das Styling auf Android war teilweise deutlich anders als auf iOS, hier mussten wir vieles doppelt anpassen.
- Der Craving Algorithmus war technisch anspruchsvoll: Wir brauchten lange, bis wir ein gutes System fanden, das die Rezepte sinnvoll nach Lust und Geschmack filtert.
- Es war nicht immer jede Person anwesend, durch Überstundenabbau, Resturlaub oder Krankheit fehlte manchmal jemand, was die Planung etwas erschwert hat.

---

### 💡 Was haben wir gelernt?

- Aufgaben flexibel im Team zu übernehmen, wenn jemand kurzfristig fehlt.
- Bessere Kommunikation im Team und wie man Ideen gemeinsam sinnvoll vereint.
- Programmieren mit React Native und die praktische Nutzung von Firebase als Backend.
- Bilder speichern und hochladen mit Firebase Storage.
- Arbeiten unter Zeitdruck und dennoch strukturiert bleiben.
- Mockups zuerst durchdenken und als Grundlage für die Entwicklung verwenden.
- Wie man Features sinnvoll aufteilt und realistisch plant.

---

### 🎯 Zufriedenheit mit dem Ergebnis

Wir sind sehr zufrieden und stolz auf unser Endergebnis.  
Trotz begrenzter Zeit haben wir fast alle unsere Ziele erreicht, nur zwei optionale Ziele fehlen noch.  
Wir finden es sehr beeindruckend, was man als Team in drei Wochen auf die Beine stellen kann.  
Die App ist voll funktional und wir sind mehr als happy mit dem, was wir geschafft haben.

---

### 🚧 Was fehlte noch?

Alle verpflichtenden Features sind umgesetzt, nur zwei optionale Ziele konnten wir aus Zeitgründen noch nicht fertigstellen:

| Ziel-ID | Feature                                                                                                           | Status |
|---------|-------------------------------------------------------------------------------------------------------------------|--------|
| O-08    | Als Nutzer:in möchte ich private Nachrichten an andere Nutzer:innen senden können, um mich über Rezepte auszutauschen. | ❌     |
| O-05    | Als Nutzer:in möchte ich ein Bild von meinem Kühlschrank machen, damit eine AI passende Rezepte vorschlägt.         | ❌     |

Diese beiden Features möchten wir gerne in unserer Freizeit noch gemeinsam fertigstellen:

- **Chatfunktion**: Damit man sich mit anderen Usern über Cravings und Rezepte austauschen oder Rezepte teilen kann.
- **AI-Kühlschrankscanner**: Ein Feature, bei dem man seinen Kühlschrank scannt und die App anhand der vorhandenen Zutaten passende Rezeptvorschläge macht.

Langfristig möchten wir unsere App veröffentlichen und mit diesen Funktionen noch weiter ausbauen.

---

### 🤝 Zusammenarbeit im Team

Die Zusammenarbeit im Team verlief genau wie erhofft! Sehr harmonisch, effizient und reibungslos.  
Da wir uns auch ausserhalb des Projekts sehr gut verstehen, konnten wir auf einer vertrauensvollen Basis arbeiten, was
sich stark positiv auf den Projektverlauf ausgewirkt hat.

---



