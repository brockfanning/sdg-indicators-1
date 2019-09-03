---
title: Frequently Asked Questions (FAQ)
permalink: /faq/
layout: page
---

## Wie kann ich neue oder andere Datenquellen vorschlagen?
Für Feedback zu den von uns verwendeten Datenquellen oder für Vorschläge zu neuen Datenquellen, kontaktieren Sie uns bitte hier: <a href="mailto:{{site.email_contacts.questions}}">{{site.email_contacts.questions}}</a>.

## Was bedeutet der Berichtsstatus?
Für jeden Indikator gibt es drei verschiedene Kennzeichungen zu dessen Berichtsstatus. Diese unterscheiden sich farblich folgendermaßen:

* Grün: Online berichtet - die national aggregierten Daten für diesen Indikator sind auf dieser Website verfügbar. Jedoch sind die Daten teilweise noch nicht nach weiteren Kategorien und Kriterien aufgeschlüsselt verfügbar. Weitere Daten zu Disaggregationen werden gesucht und geprüft.
* Orange: Statistik in Arbeit - es wurde eine geeignete Datenquelle für diesen Indikator oder einen Proxy-Indikator  identifiziert. Aktuell werden die Daten auf ihre Qualität geprüft und für die Veröffentlichung vorbereitet.
* Rot: Datenquellensuche - Für diesen Indikator wird noch nach einer geeignete Datenquelle gesucht.

Zusätzliche Informationen über den Status der Erhebung und die Berichterstattung eines Indikators finden Sie im oberen Abschnitt auf der Indikatorseite.

## Was ist Disaggregation?
Eine Disaggregation dient dazu, einen bestehenden Indikator zur genaueren Betrachtung in weitere Unterkategorien aufzuteilen. Die bekanntesten sind Alter oder Geschlecht. Für jeden Indikator gelten jedoch gesonderte Disaggregationen, die im Indikatornamen oder durch die für den Indikator zuständige internationale Organisation festgelegt sind.

## Wie werden Datenlücken geschlossen?
Sollten für einen Indikator keine Daten vorliegen, werden mögliche Datenquellen gesucht und auf ihre Qualität hin geprüft. Genügt die Qualität unseren Ansprüchen werden die Daten in die Berichtsplattform aufgenommen.

Bei einigen Indikatoren liegen zwar Daten auf nationaler Ebene vor, aber die zugrundeliegenden Datenquellen lassen keine Disaggregation nach allen geforderten Kategorien zu.

In diesen Fällen wird nach neuen Datenquellen gesucht oder müssen die bestehenden Quellen verknüpft oder auch Daten modelliert werden. Hierzu tragen die jeweils betroffenen Fachbereiche im Statistischen Bundesamt (Destatis) kontinuierlich bei.


## Können andere Länder diese Website kopieren?
Die Website kann von anderen Staaten frei verwendet werden, um eine eigene Berichtsplattform zu erstellen. Es gelten die Bedingungen für die Nutzung von Github. Weitere Informationen finden Sie unter [Technische Hinweise](https://g205sdgs.github.io/sdg-indicators/guidance/).

<!-- DO NOT REMOVE ANYTHING BELOW THIS LINE -->
<script type='text/javascript'>
document.addEventListener("DOMContentLoaded", function () {
  $('#main-content h2').addClass('roleHeader');
 	$('#main-content h2').attr({
 	  'tabindex': 0,
 	  'role': 'button'
 	});
 	$('.roleHeader').click(function () {
 	  $(this).nextUntil('h2').stop(true, true).slideToggle();
	 }).nextUntil('h2').hide();
	 $('.roleHeader').keypress(function (e) {
 	  if (e.which == 13) { // Enter key pressed
			   $(this).trigger('click');
		  }
	 });
})
 </script>
