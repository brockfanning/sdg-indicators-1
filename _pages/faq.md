---
title: Frequently Asked Questions (FAQ)
permalink: /faq/
layout: page
---

## Wie kann ich neue oder andere Datenquellen vorschlagen?
Wenn Sie Feedback zu den von uns verwendeten Datenquellen haben oder Vorschläge für neue Datenquellen haben, senden Sie uns bitte eine E-Mail an <a href="mailto:{{site.email_contacts.questions}}">{{site.email_contacts.questions}}</a>.

## Was bedeutet der Berichtsstatus?
Für einen Indikator haben wir drei verschiedene Kenneichungen zum Berichtsstatus verwendet, die ebenfalls farblich gekennzeichnet sind:

* Online berichtet (grün) - mindestens die nationalen Gesamtdaten für diesen Indikator sind auf dieser Website verfügbar, aber die Daten sind möglicherweise noch nicht vollständig aufgeschlüsselt. Wir sind weiterhin auf der Suche nach zusätzlichen Disaggregationen.
* Laufende Statistiken (Orange) - wir haben eine geeignete Datenquelle für diesen Indikator oder die entsprechende Vollmacht auf nationaler Ebene gefunden. Wir sind derzeit dabei, die Daten auf ihre Qualität zu überprüfen und für die Veröffentlichung vorzubereiten.
* Erkundung von Datenquellen (rot) - wir sind noch auf der Suche nach einer geeigneten Datenquelle für diesen Indikator.

Wenn es zusätzliche Informationen über den Status der Erhebung und Berichterstattung von Indikatordaten gibt, werden diese oben auf der Indikatorseite angezeigt.

## Wie oft werden neue Daten auf dieser Website hinzugefügt?
Wir werden die Daten ergänzen, sobald sie geprüft wurden. Dazu gehören neue Daten ebenso wie die Aktualisierung bereits veröffentlichter Daten. Wir werden weiterhin, wo immer möglich, in Zusammenarbeit mit den Themenexperten Daten aus bestehenden Quellen sammeln.

## Was tun wir, um Datenlücken zu schließen?
Bei einigen Indikatoren haben wir zwar Daten auf nationaler Ebene, aber unsere bestehenden Datenquellen erlauben es uns nicht immer, nach allen Hauptgruppen zu disaggregieren.

Das bedeutet, dass wir nach neuen Datenquellen suchen, bestehende verknüpfen oder Daten modellieren müssen. Dazu arbeiten wir mit Kollegen aus dem gesamten Statistischen Bundesamt(Destatis) zusammen.

## Wie Barrierefrei ist diese Website?
Unser Ziel ist es, diese Website für jeden Nutzer so zugänglich und nutzbar wie möglich zu machen.

## Können andere Länder diese Website kopieren?
Ja. Weitere Informationen finden Sie unter [Technische Hinweise](https://g205sdgs.github.io/sdg-indicators/guidance/).

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
