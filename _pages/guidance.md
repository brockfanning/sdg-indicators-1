---
title: Technische Hinweise
permalink: /guidance/
layout: page
---

## Nationale Berichtsplattform - SDG

Die Nationale Berichtsplattform (National Reporting Platform - NRP) ist ein öffentlich zugängliches Instrument zur Verbreitung und Präsentation von Daten für Deutschland zu den Indikatoren der Ziele zur nachhaltigen Entwicklung (Sustainable Development Goals - SDGs) der Agenda 2030 der Vereinten Nationen (VN).

### Unsere Herangehensweise

Um den grundlegenden Prinzipien der VN für die amtliche Statistik zu entsprechen, sollten die Mindesteigenschaften einer SDG-NRP folgende sein: <br>
Die NRP
- wird von den nationalen statistischen Ämtern verwaltet;
- enthält offizielle Statistiken und Metadaten nach bewährter Standardmethodik;
- ist öffentlich zugänglich;
- ermöglicht Rückmeldungen von Datennutzern;
- wird mit Open-Source (kostenlosen) Technologien betrieben.

Darüber hinaus wurde die deutsche NRP nach anerkannten internationalen Richtlinien entwickelt, insbesondere hinsichtlich frei zugänglicher Daten und Software.


### Quellen

Das Statistische Bundesamt (Destatis) unterstützt aktiv die Entwicklung nationaler Berichtsplattformen, insbesondere als Open-Source Lösung zur Darstellung von SDG-Indikatoren. Vorreiter in diesem Bereich sind die USA und Großbritannien.
Die aktuelle Version der deutschen Berichtsplattform wurde auf der Grundlage einer früheren Version der britischen NRP entwickelt und an die Bedürfnisse der deutschen Statistik angepasst.
Der Projektcode ist im folgenden [GitHub Repository](https://github.com/G205SDGs/sdg-indicators) öffentlich zugänglich.

Eine neue universelle Version der von den USA, Großbritannien und dem Center for Open Data Enterprise entwickelten SDG-Berichtsplattform ist verfügbar.
Wir empfehlen Ihnen, sich mit den SDG-Plattformen der USA und Großbritanniens und der entsprechenden Projektdokumentation vertraut zu machen.

- [USA NRP SDG](https://gsa.github.io/sdg-indicators-usa)

- [GB NRP SDG](https://sustainabledevelopment-uk.github.io)

### Genutzte Software

#### Back-end IT-Anforderungen:
- GitHub: Hosting der Website, die für die Programmierung von Projekten mit dem Git-Versionskontrollsystem entwickelt wurde.
- Jekyll: Generator für statische Seiten, die in Ruby geschrieben wurden.

#### Front-end IT-Anforderungen:
- XHTML, CSS, JavaScript
- Chartist: JavaScript Bibliothek
- Bootstrap: framework CSS

### Aktuelle Darstellung

Aufgrund von technischen Schwierigkeiten finden sich auf der aktuellen Version der deutschen NRP einige mangelhafte Darstellungen, auf die an dieser Stelle hingewiesen wird:
- Ganze Zahlen werden ohne Nachkommastelle dargestellt (auch in Zeitreihen, in denen andere Zahlenwerte mit Nachkommastelle vorhanden sind).
- Sehr lange Zeitreihenbezeichnungen werden in den Achsenbeschriftungen der Grafiken nicht in mehrere Zeilen umgebrochen und z.T. abgeschnitten.
