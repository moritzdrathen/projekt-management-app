# Projekt- und Aufgabenmanagementsystem

Universitätsprojekt im Rahmen des Kurses "Programmierung von Web-Anwendungen" (DLBITOWAWBI01) an der IU Internationale Hochschule.

Eine webbasierte Anwendung zur Verwaltung von Projekten und Aufgaben für ein IT-Dienstleistungsunternehmen.

## Tech Stack

**Backend**
- Java 17, Spring Boot 3.2.4
- Spring Security 6 mit JWT-Authentifizierung
- Spring Data JPA, H2-Datenbank (dateibasiert)
- Maven

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS
- Axios, React Router v6
- @dnd-kit (Drag & Drop Kanban-Board)

## Projektstruktur

```
projekt-management-app/
├── backend/        # Spring Boot Anwendung
└── frontend/       # React/TypeScript Anwendung
```

## Setup & Starten

### Backend

```bash
cd backend
mvn spring-boot:run
```

Der Backend-Server startet auf `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Das Frontend ist erreichbar unter `http://localhost:5173`.

### API-Dokumentation (Swagger UI)

```
http://localhost:8080/swagger-ui.html
```

## Standard-Zugangsdaten

| Benutzer | Passwort | Rolle |
|----------|----------|-------|
| admin    | admin123 | ADMIN |

Der Admin-Account wird beim ersten Start automatisch angelegt.

## Rollen & Berechtigungen

| Funktion | ADMIN | PROJECT_MANAGER | EMPLOYEE |
|----------|-------|-----------------|----------|
| Benutzer verwalten | ✓ | – | – |
| Projekte erstellen/bearbeiten | ✓ | ✓ | – |
| Projekte archivieren | ✓ | ✓ | – |
| Mitglieder hinzufügen | ✓ | ✓ | – |
| Aufgaben erstellen/bearbeiten | ✓ | ✓ | ✓ |
| Aufgabenstatus ändern (Kanban) | ✓ | ✓ | ✓ |

## Tests

```bash
cd backend
mvn test
```
