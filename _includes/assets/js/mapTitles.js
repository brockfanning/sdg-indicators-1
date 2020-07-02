opensdg.maptitles = function(indicatorId) {
  if(indicatorId == "indicator_8-5-1"){

    this.mapTitle = translations.t("gender pay gap")
    this.mapUnit = translations.t("%")
  }

  return [this.mapTitle, this.mapUnit] ;

};
