# was alles anpassen? 

- benutzung der app -> 4. Rezept Browser -> name von feature wo man rezepte filtern kann
- api dokumentation anpassen auf unsere vorallem endpunkte! 
- Projektstruktur alles nur als beispiel von knowledgehub! 
-  Testfälle anschauen und überarbeiten wenn nötig
- testergebniusse anpasse und durchführen nur als beispiel dort von knowledgehub
- abschnitt autimatisierte test löschen wenn wir keine erstellt haben sonst so lassen! 
- gui design anpassen ganzer abschnitt nur als beispiel
- fazit ganzer abschnitt anpassen nur als beispiel hier von knowledgehub
- geht alles im inhaltsverzeichniss? braucht es alles? ist es aktuell? 

---

# <img src="/assets/Logo.png" alt="Logo" width="25">  Hungry on the go? - Yumigo <img src="/assets/Logo.png" alt="Logo" width="25">

---
## Dokumentation
### 8. Juli 2025 | Projektteam: Serra-Naz Akin, Selina Mogicatom, Timea Portmann

---

# 📑 Inhalt

1. [Einleitung](#1--einleitung)
2. [Abstract](#2--abstract)
3. [Benutzung der App](#3--benutzung-der-app)
4. [Funktionen](#4--funktionen)
5. [API-Dokumentation](#5--api-dokumentation)
6. [Projektstruktur](#6--projektstruktur)
  - [Frontend im Detail](#61--frontend-im-detail)
  - [Backend im Detail](#62--backend-im-detail)
7. [Anforderungsanalyse](#7--anforderungsanalyse)
  - [User Stories](#71--user-stories)
  - [Testfälle](#72--testfälle)
  - [Testergebnisse](#73--testergebnisse)
  - [Automatisierte Tests](#74--automatisierte-tests)
8. [GUI Design](#8--gui-design)
  - [Allgemein](#81--allgemein)
  - [Design-Richtlinien](#82--design-richtlinien-optional)
9. [Fazit](#9--fazit)

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

💡 Ein JWT wird im Hintergrund verwaltet – dadurch bleiben Benutzer auch nach einem Seitenreload eingeloggt.

---

# 4. ⚙️ Funktionen

--- 


# 5. 📡 API-Dokumentation

Die REST-API des Backends wurde mit Firebase erstellt und folgt den üblichen Konventionen von HTTP-Verben (GET, POST,
PUT, DELETE).

### 🧯 Fehlerbehandlung

**Typische Fehlermeldungen:**

- 401 Unauthorized – Kein oder ungültiges Token
- 403 Forbidden – Zugriff auf fremde Ressourcen
- 404 Not Found – Objekt existiert nicht
- 400 Bad Request – Validierungsfehler bei Formulardaten

### 🔐 Authentifizierung

- POST /api/auth/login  
  → Gibt ein JWT zurück, das im Header verwendet wird

- POST /api/auth/register  
  → Registrierung eines neuen Benutzers

### 📘 Notenverwaltung

- GET /api/grades  
  → Gibt alle Noten des eingeloggten Benutzers zurück

- POST /api/grades
  → Neue Note hinzufügen

### ✅ ToDos

- GET /api/todos
  → Gibt alle offenen ToDos zurück

- POST /api/todos
  → Neues ToDo erstellen

- PUT /api/todos/{id}
  → Status ändern (erledigt / offen)

### 💬 Beiträge & Kommentare

- GET /api/posts
  → Beiträge abrufen

- POST /api/posts
  → Neuen Beitrag erstellen

- POST /api/comments
  → Kommentar zu Beitrag speichern

### 🛡 Header mit JWT

Alle geschützten Routen erfordern:
→ Authorization: Bearer <TOKEN>

---

# 6. 📂 Projektstruktur

## 6.1 🖥️ Frontend im Detail

Das Frontend von *KnowledgeHub* wurde mit **React.js** umgesetzt. Als Build-Tool kam **Vite** zum Einsatz, was eine
schnelle Entwicklungs- und Ladezeit ermöglichte. Für das Styling wurde **Bootstrap 5** verwendet, ergänzt durch ein
eigenes Farbschema in theme.css, das auch den Light-/Darkmode unterstützt.

### 🔧 Technologien

- **React.js (mit Vite)**
- **Bootstrap 5**
- **Custom Theme (Dark/Light)**
- **React Router (Pages & Routing)**
- **LocalStorage** zur Speicherung des JWT & Theme

### 📁 Projektstruktur (Frontend)

```
📦 src/
├── components/         # Wiederverwendbare UI-Komponenten
│   ├── auth/           # Login, Registrierung, Buttons
│   ├── community/      # Beiträge und Kommentare
│   ├── grademanager/   # Notenstruktur & Anzeige
│   ├── layout/         # Navbar, Footer etc.
│   ├── sticky-notes/   # Zusatzmodul Sticky Notes
│   └── todos/          # Aufgabenmanagement
├── context/            # Globale States (ThemeContext)
├── layouts/            # Hauptlayout mit Routing-Outlet
├── lib/                # API-Aufrufe, Authentifizierung, Logik
├── pages/              # Routen für jede Hauptansicht
├── main.jsx            # Einstiegspunkt
├── router.jsx          # Routenstruktur (React Router)
└── theme.css           # Light/Dark Theme Farben
```

### 🔄 Routing / Navigation

Die App nutzt **React Router** zur Navigation. Es gibt folgende Haupt-Routen:

- /auth/login – Login-Seite
- /auth/register – Registrierung
- /dashboard – Übersicht über alle Module
- /grademanager/* – Schulnotenverwaltung
- /todos – Aufgabenverwaltung
- /community – Beiträge & Kommentare

Private Routen sind durch eine ProtectedRoute-Komponente geschützt, die prüft, ob ein gültiger JWT vorhanden ist.

### 🌗 Theme (Light-/Darkmode)

Der ThemeContext erlaubt die Umschaltung zwischen Light- und Darkmode. Die gewählte Einstellung wird lokal im
localStorage gespeichert und beim Seitenladen angewendet.

**Verwendete Farben:**

- #3B82F6 für Akzente (z.B Buttons, Links)
- #0F172A für Darkmode-Hintergrund
- Neutrale Grautöne für Texte und Rahmen

### 🧩 Komponentenstruktur

Die Komponenten wurden thematisch gruppiert und folgen einem konsistenten Aufbau. Props werden zur Datenweitergabe
genutzt.

**Beispiele:**

- GradeForm.jsx – Formular zum Eingeben neuer Noten
- SubjectCard.jsx – Darstellung eines Fachs mit zugehörigen Noten
- PostForm.jsx – Beitrag im Community-Bereich erstellen
- CommentForm.jsx – Kommentare schreiben
- TodoItem.jsx – Einzelne Aufgabe inkl. Statusumschaltung

--- 

## 6.2 ⚙️ Backend im Detail

Das Backend der Anwendung wurde mit **Spring Boot (Java)** entwickelt. Es stellt eine REST-API bereit, die vom Frontend
über HTTP angesprochen wird. Die Daten werden in einer **MySQL-Datenbank** gespeichert, die beim Start der App über
Flyway-Migrationen initialisiert wird.

### 🔐 Sicherheit

Für Authentifizierung und Autorisierung wurde **Spring Security** mit **JWT (JSON Web Tokens)** integriert.  
Benutzer müssen sich registrieren und erhalten beim Login ein gültiges Token, das bei allen Folgeanfragen im Header
mitgeschickt wird.

Nur authentifizierte Benutzer können auf geschützte Ressourcen zugreifen, und jeder User kann nur seine eigenen Daten
bearbeiten (z. B. ToDos, Noten, etc.).

### 🧱 Backend-Struktur (Auszug aus src/main/java/...)

```
📦 src/
├── main/
│   └── java/
│       └── org.example/
│           ├── bootstrap/
│           │   └── DataBootstrap.java
│           ├── community/
│           │   ├── comment/
│           │   │   ├── Comment.java, CommentController.java
│           │   │   ├── CommentService.java, CommentMapper.java
│           │   │   ├── CommentRepository.java
│           │   │   └── CommentRequestDTO / ResponseDTO
│           │   └── post/
│           │       ├── Post.java, PostController.java, PostService.java
│           │       ├── PostMapper.java, PostRepository.java
│           │       └── PostRequestDTO / ResponseDTO
│           ├── configuration/
│           │   ├── AppConfiguration.java, WebConfiguration.java
│           │   ├── JWTConfiguration.java, OpenAPIConfiguration.java
│           ├── gradebook/
│           │   ├── grade/
│           │   │   ├── Grade.java, GradeController.java, GradeService.java
│           │   │   ├── GradeMapper.java, GradeRepository.java
│           │   │   └── GradeRequestDTO / ResponseDTO
│           │   ├── school/
│           │   │   ├── School.java, SchoolController.java, SchoolService.java
│           │   │   ├── SchoolMapper.java, SchoolRepository.java
│           │   │   └── SchoolRequestDTO / ResponseDTO / DetailDTO
│           │   ├── semester/
│           │   │   ├── Semester.java, SemesterController.java, SemesterService.java
│           │   │   ├── SemesterMapper.java, SemesterRepository.java
│           │   │   └── SemesterRequestDTO / ResponseDTO / DetailDTO
│           │   └── subject/
│           │       ├── Subject.java, SubjectController.java, SubjectService.java
│           │       ├── SubjectMapper.java, SubjectRepository.java
│           │       └── SubjectRequestDTO / ResponseDTO / DetailsDTO
│           ├── sticky_notes/
│           │   ├── StickyNote.java, StickyNoteController.java, StickyNoteService.java
│           │   ├── StickyNoteMapper.java, StickyNoteRepository.java
│           │   └── StickyNoteRequestDTO / ResponseDTO
│           ├── todoAdvanced/
│           │   ├── folder/
│           │   │   ├── Folder.java, FolderController.java, FolderService.java
│           │   │   ├── FolderMapper.java, FolderRepository.java
│           │   │   └── FolderRequestDTO / ResponseDTO / DetailDTO
│           │   ├── list/
│           │   │   ├── TodoList.java, TodoListController.java, TodoListService.java
│           │   │   ├── TodoListMapper.java, TodoListRepository.java
│           │   │   └── TodoListRequestDTO / ResponseDTO / DetailDTO
│           │   └── todo/
│           │       ├── Todo.java, ToDoController.java, ToDoService.java
│           │       ├── TodoMapper.java, TodoRepository.java
│           │       └── ToDoRequestDTO / ResponseDTO
│           ├── user/
│           │   ├── Person.java, PersonController.java, PersonService.java
│           │   ├── PersonMapper.java, PersonRepository.java
│           │   ├── PersonAuthenticationToken.java, PersonConverter.java
│           │   └── PersonRequestDTO / ResponseDTO / SignInDTO / TokenResponseDTO
│           ├── App.java
│           └── FailedValidationException.java
├── resources/
│   ├── db.migration/
│   │   ├── V1__schema.sql
│   │   ├── V2.0–V7.0__migration_steps.sql
│   └── application.properties
```

### 📄 Datenbank & Migration

Die Datenbankstruktur wurde über **Flyway SQL-Skripte** erstellt und erweitert.  
Alle Migrationen befinden sich im Verzeichnis resources/db.migration/.

Beispiele für Migrationsdateien:

- V1__schema.sql
- V2.0__initial_data.sql
- V3.0__add_foreign_keys.sql  
  ... bis V7.0

### 🔄 API-Endpunkte (Auszug)

Die API folgt einem **RESTful Design**. Die meisten Pfade sind nach dem Schema aufgebaut:

- /api/auth
- /api/grades
- /api/todos
- /api/posts
- /api/comments

Die Endpunkte nutzen HTTP-Methoden wie GET, POST, PUT, DELETE`

### 🔧 DTOs, Mapper und Services

Die Business-Logik ist klar getrennt in:

- **Controller:** REST-Schnittstelle
- **Service:** Logikschicht
- **Repository:** Datenbankzugriffe (JPA)
- **Mapper:** DTO ↔ Entity Konvertierung

Beispielhafte DTOs:

- GradeRequestDTO, GradeResponseDTO
- PersonSignInDTO, TokenResponseDTO

--- 

# 7. 🔍 Anforderungsanalyse

## 7.1 📌 User Stories

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

| **ID** | **Beschreibung**                                                                                                                                     | **Erreicht?** |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| O-01   | Als Nutzer:in möchte ich meine Lieblingsrezepte bewerten können.                                                                                     | ❌             |
| O-02   | Als Nutzer:in möchte ich Rezepte mit Freunden teilen können.                                                                                         | ❌             |
| O-03   | Als Nutzer:in möchte ich eine Einkaufsliste aus einem Rezept erstellen können, um meinen nächsten Einkauf optional planen zu können.                | ❌             |
| O-04   | Als Nutzer:in möchte ich meinen Standort teilen, damit mir saisonale Rezepte aus meiner Region angezeigt werden.                                    | ❌             |
| O-05   | Als Nutzer:in möchte ich ein Bild von meinem Kühlschrank oder meinen Vorräten fotografieren können, damit eine AI passende Rezepte vorschlägt.     | ❌             |
| O-06   | Als Nutzer:in möchte ich mein Profil über einen Share-Button (z. B. über WhatsApp oder Instagram) teilen können.                                     | ❌             |
| O-07   | Als Nutzer:in möchte ich direkt in der Yumigo-App meine Rezepte über einen Chat teilen können.                                                       | ❌             |
| O-08   | Als Nutzer:in möchte ich private Nachrichten an andere Nutzer:innen senden können, um mich über Rezepte und Cravings austauschen zu können.         | ❌             |


---

## 7.2 📌 Testfälle

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
| **Erwartet**      | Rezept wird erfolgreich gespeichert, Änderungen übernommen und anschließend gelöscht.                   |

### Testfall: Rezepte nach Kategorien durchsuchen

| **ID**            | T-C02                                                                             |
|-------------------|------------------------------------------------------------------------------------|
| **Anforderungen** | C-02 (Rezepte nach Kategorien)                                                    |
| **Ablauf**        | Nutzer:in wählt in der Kategorieübersicht „etwas Süsses“.                         |
| **Erwartet**      | Es werden nur Rezepte angezeigt, die der Kategorie „etwas Süsses“ zugeordnet sind. |

### Testfall: Saisonfilter aktivieren

| **ID**            | T-C03                                                                                  |
|-------------------|-----------------------------------------------------------------------------------------|
| **Anforderungen** | C-03 (Saisonale Zutaten filtern)                                                       |
| **Ablauf**        | Nutzer:in aktiviert den Saisonfilter für den Monat Juni.                               |
| **Erwartet**      | Nur Rezepte mit saisonal verfügbaren Zutaten (z. B. Spargel, Erdbeeren) werden gezeigt. |

### Testfall: Rezeptdetailseite aufrufen

| **ID**            | T-C04                                                                    |
|-------------------|---------------------------------------------------------------------------|
| **Anforderungen** | C-04 (Rezeptdetails anzeigen)                                             |
| **Ablauf**        | Nutzer:in klickt auf das Rezept „Ofenkartoffeln mit Quark“.              |
| **Erwartet**      | Detailansicht mit Zutatenliste, Bildern und Zubereitung wird angezeigt.  |

### Testfall: Rezept favorisieren

| **ID**            | T-R02                                                                       |
|-------------------|------------------------------------------------------------------------------|
| **Anforderungen** | R-02 (Rezepte favorisieren)                                                  |
| **Ablauf**        | Nutzer:in klickt auf das Herzsymbol beim Rezept „Kichererbsen-Curry“.       |
| **Erwartet**      | Rezept wird als Favorit gespeichert und ist im Profil unter Favoriten sichtbar. |

### Testfall: Person folgen

| **ID**            | T-P01                                                    |
|-------------------|-----------------------------------------------------------|
| **Anforderungen** | P-01 (Personen folgen)                                    |
| **Ablauf**        | Nutzer:in klickt im Profil von „@kochliebe“ auf „Folgen“. |
| **Erwartet**      | @kochliebe wird in der „Gefolgt“-Liste des Nutzers angezeigt. |

### Testfall: Profil & eigene Rezepte anzeigen

| **ID**            | T-P02                                                                        |
|-------------------|-------------------------------------------------------------------------------|
| **Anforderungen** | P-02 (Eigenes Profil einsehen)                                                |
| **Ablauf**        | Nutzer:in öffnet den Reiter „Mein Profil“ in der Navigationsleiste.           |
| **Erwartet**      | Alle hochgeladenen Rezepte und gespeicherten Favoriten sind dort sichtbar.    |


---

## 7.3 📌 Testergebnisse

| **ID** | **Erfolgreich** | **Wer?** | **Datum und Uhrzeit** |
|--------|-----------------|----------|-----------------------|
| T-01   | ✅               | Rasim    | 14.04.2025, 16:00 Uhr |
| T-02   | ✅               | Lysandro | 14.04.2025, 15:00 Uhr |
| T-03   | ✅               | Serra    | 14.04.2025, 14:10 Uhr |
| T-04   | ✅               | Serra    | 14.04.2025, 14:10 Uhr |
| T-05   | ✅               | Rasim    | 14.04.2025, 16:00 Uhr |
| T-06   | ✅               | Lysandro | 14.04.2025, 15:00 Uhr |
| T-07   | ✅               | Rasim    | 14.04.2025, 16:00 Uhr |
| T-08   | ✅               | Mateo    | 15.04.2025, 9:30 Uhr  |
| T-09   | ✅               | Mateo    | 14.04.2025, 9:30 Uhr  |
| T-10   | ✅               | Rasim    | 14.04.2025, 16:00 Uhr |
| T-11   | ✅ ❌             | Rasim    | 14.04.2025, 16:00 Uhr |

**Bemerkung T-11:**  
Die Datei wird erfolgreich hochgeladen und ist für *den Uploader* sichtbar.  
Allerdings können andere Benutzer aktuell nicht auf die hochgeladene Datei zugreifen.  
Um dies zu ermöglichen, wäre ein serverseitiger Datei-Host notwendig – dieses Thema werden wir voraussichtlich demnächst
gemeinsam mit Ivan besprechen.


---
## 7.4 📌 Automatisierte Tests

Sowohl im Frontend als auch im Backend wurden Tests geschrieben:

- **Frontend**: Wir haben mit **Vitest** Unit-Tests für einzelne Komponenten und Funktionen erstellt, um die Funktionalität sicherzustellen und frühzeitig Fehler zu erkennen.
- **Backend**: Auch im Backend wurden **Unit-Tests** geschrieben, um die Logik der einzelnen Module zuverlässig zu überprüfen.

Diese Tests helfen dabei, die Stabilität der Anwendung zu gewährleisten und spätere Änderungen abzusichern.

--- 

# 8. 🎨 GUI Design

## 8.1 🎨 Allgemein

Beim Design von unserem Projekt haben wir Bootstrap verwendet, da Selina dies schon genutzt hat und man mit Bootstrap
schnell und effektiv Seiten erstellen kann.

Wichtig waren uns:

- Responsive Design
- Light-/Darkmode
- Übersichtliches Dashboard
- Klare Strukturierung der Inhalte (Noten, Aufgaben, Community)

## 8.2 🎨 Design-Richtlinien

- **Hauptfarben:**
  - Blau: #3B82F6 (Buttons, Highlights)
  - Dunkelblau: #0F172A (Darkmode-Hintergrund)

- **Typografie:**
  - Schriftart: 'Segoe UI', sans-serif

- **Komponenten:**
  - Bootstrap Cards, Buttons, Modals
  - Responsive Grids

- **User Experience:**
  - Fokus auf Klarheit & Lesbarkeit
  - Minimalistisches Layout

---

# 9. 🏁 Fazit

### ✅ Was lief gut?

- Die Strukturierung des Projekts in Module half beim schnellen Fortschritt.
- Authentifizierung mit JWT funktionierte nach kurzer Einarbeitung gut.
- React-Komponentenstruktur machte die Wiederverwendung effizient.
- Die Trennung von Frontend und Backend war sauber, wodurch die Teamarbeit flüssig ablief.

### ❌ Herausforderungen

- Beim Einrichten der Datenbank gab es kleinere Verbindungsprobleme, deshalb haben wir danach mit Flyway gearbeitet, um
  uns die Arbeit zu erleichtern.
- Die Umsetzung der To-dos inklusive Ordnerstruktur war technisch herausfordernd, da viele Datenabhängigkeiten und
  verschachtelte Strukturen berücksichtigt werden mussten.
- Auch die Strukturierung der gesamten App und die Aufteilung in sinnvolle Module (Frontend wie Backend) erforderte zu
  Beginn viel Planung und Abstimmung.
- Das Loginsystem hätte Selina weniger Zeit gekostet, wenn wir es von Anfang an gemacht hätten.
- Frontend und Backend parallel entwickelt – aber Schnittstellenabstimmung war herausfordernd:
  Selina hat das Frontend und Timea das Backend gleichzeitig umgesetzt. Obwohl diese parallele Entwicklung effizient schien, stellte sich das anschliessende Zusammenführen als aufwändig heraus. Viele API-Endpunkte mussten im Frontend manuell angepasst werden, weil sie zunächst nicht exakt auf die Backend-Logik abgestimmt waren.


### 💡 Was haben wir gelernt?

- Sicherheit mit Spring Security praktisch umzusetzen
- REST-API Design und React-Kommunikation im Detail
- Umgang mit komplexen Datenstrukturen (z.B. verschachtelte Entitäten bei Schule → Semester → Fach → Noten)
- Kollaboratives Arbeiten mit GitFlow und allgemein Git(regelmässige Commits, saubere Branches, Merge-Konflikte vermeiden)
- Frontend und Backend sollten in kleineren, aufeinander abgestimmten Schritten entwickelt werden – idealerweise jeweils basierend auf zuvor definierten oder getesteten Schnittstellen. So kann die Integration deutlich reibungsloser und effizienter erfolgen. Eine kontinuierliche und frühzeitige Abstimmung bei der API-Planung ist entscheidend für eine erfolgreiche Fullstack-Entwicklung.

### 🚀 Zukunftsideen und Erweiterungspotential

Während der Entwicklung sind uns einige Ideen für zukünftige Features gekommen, die das System noch nützlicher und
interaktiver machen würden:

- **Like-Funktion für Kommentare**: So können nützliche oder hilfreiche Antworten hervorgehoben werden.
- **Bearbeiten von Kommentaren**: Aktuell kann man Kommentare nicht mehr ändern – eine Edit-Funktion würde mehr
  Flexibilität bieten.
- **Autor:innen sichtbar machen**: Bei Kommentaren soll künftig sichtbar sein, wer den Kommentar geschrieben hat.
- **Notenstatistiken & Diagramme**: Eine visuelle Darstellung des Notenverlaufs über mehrere Semester würde den
  Fortschritt besser veranschaulichen.
- **Tag-System im Community-Bereich**: Beiträge könnten nach Themen (Mathe, IT, Prüfungsvorbereitung, etc.) gefiltert
  werden.
- **Benachrichtigungen**: Erinnerungen bei nahenden Deadlines für ToDos wären eine hilfreiche Ergänzung.

Diese Erweiterungen würden die Plattform nicht nur funktionaler, sondern auch persönlicher und benutzerfreundlicher
machen.

### 🤝 Zusammenarbeit im Team

Die Zusammenarbeit im Team verlief genau wie erhofft – **sehr harmonisch, effizient und reibungslos**.  
Da wir uns auch ausserhalb des Projekts sehr gut verstehen, konnten wir auf einer vertrauensvollen Basis arbeiten, was
sich stark positiv auf den Projektverlauf ausgewirkt hat.

Wir haben früh entschieden, mit einem klaren **Git-Flow** zu arbeiten:  
Jede von uns arbeitete in separaten Branches, wodurch **Merge-Konflikte vermieden** wurden und die Integration neuer
Features sehr sauber erfolgen konnte.  
Regelmässige Absprachen und gemeinsame Code-Reviews halfen uns, den Überblick zu behalten und sicherzustellen, dass alle
Teile gut zusammenspielen.

Insgesamt hat uns diese Arbeitsweise nicht nur produktiv gemacht, sondern auch viel Freude bereitet.

---



