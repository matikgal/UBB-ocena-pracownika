export const publikacjeDydaktyczne = [
  { id: "1.1", title: "Autorstwo podręcznika akademickiego w języku obcym", points: 40, tooltip: "1,2" },
  { id: "1.2", title: "Autorstwo podręcznika akademickiego w języku polskim", points: 30, tooltip: "1,2" },
  { id: "1.3", title: "Autorstwo skryptu", points: 20 },
  { id: "1.4", title: "Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)", points: "Punktacja wg systemu bibliotecznego" },
  { id: "1.5", title: "Tłumaczenie podręcznika akademickiego na język polski", points: 15 },
  { id: "1.6", title: "Tłumaczenie skryptu na język polski", points: 10 },
  { id: "1.7", title: "Autorstwo wspólnych publikacji ze studentami (artykuł)", points: 5, tooltip: "(za sam fakt włączenia studentów w przygotowanie publikacji)" },
  { id: "1.8", title: "Autorstwo rozdziału w podręczniku akademickim", points: 5 },
  { id: "1.9", title: "Autorstwo publikacji metodycznej lub popularnonaukowej", points: 3, tooltip: "1,2" },
  { id: "1.10", title: "Recenzja podręcznika akademickiego lub szkolnego", points: 5 },
  { id: "1.11", title: "Redakcja wydawnictwa zwartego zawierającego recenzowane publikacje studentów", points: 10 }
];

export const podniesienieJakosciNauczania = [
  { id: "2.1", title: "Koordynator/Kierownik międzynarodowego projektu dydaktycznego", points: 10, tooltip: "(maksymalnie 5 osób w zespole - do 10 pkt. na osobę na rok)" },
  { id: "2.2", title: "Koordynator/Kierownik wniosku o finansowanie międzynarodowego projektu dydaktycznego", points: 10, tooltip: "(maksymalnie 5 osób w zespole - jednorazowo do 10 pkt. na osobę)" },
  { id: "2.3", title: "Koordynator/Kierownik krajowego projektu dydaktycznego", points: 8, tooltip: "(maksymalnie 3 osoby w zespole - do 8 pkt. na osobę na rok)" },
  { id: "2.4", title: "Koordynator/Kierownik wniosku o finansowanie krajowego projektu dydaktycznego", points: 8, tooltip: "(maksymalnie 3 osoby w zespole - jednorazowo do 8 pkt. na osobę)" },
  { id: "2.5", title: "Opracowanie i wdrożenie nowej specjalności studiów", points: 5, tooltip: "(maksymalnie 4 osoby w zespole - jednorazowo do 5 pkt. na osobę)" },
  { id: "2.6", title: "Autorstwo i realizacja programu nowego przedmiotu", points: 2 },
  { id: "2.7", title: "Nowe stanowisko do zajęć laboratoryjnych lub program komputerowy", points: 5, tooltip: "(zapewnienie instrukcji laboratoryjnej lub projektowej, jednorazowo)" },
  { id: "2.8", title: "Przygotowanie lub modyfikacja programu nowych studiów podyplomowych", points: 8, tooltip: "(maksymalnie 2 osoby w zespole - jednorazowo do 8 pkt. na osobę)" },
  { id: "2.9", title: "Przygotowanie programów nowych kursów specjalistycznych", points: 5, tooltip: "(maksymalnie 2 osoby w zespole - jednorazowo do 5 pkt. na osobę)" },
  { id: "2.10", title: "Jakość prowadzenia zajęć dydaktycznych (arkusze hospitacji)", points: "Zależy od średniej ocen uzyskanych w okresie oceny" },
  { id: "2.11", title: "Jakość prowadzenia zajęć dydaktycznych (ankiety studenckie i doktoranckie)", points: "Zależy od uzyskanej średniej ocen" },
  { id: "2.12", title: "Promotorstwo prac dyplomowych licencjackich lub inżynierskich", points: 2 },
  { id: "2.13", title: "Promotorstwo prac dyplomowych magisterskich", points: 3 },
  { id: "2.14", title: "Przygotowanie recenzji prac licencjackich, inżynierskich lub magisterskich", points: 0.5 },
  { id: "2.15", title: "Prowadzenie dodatkowych zajęć sportowych", points: 5 },
  { id: "2.16", title: "Przygotowanie przedmiotu w systemie e-learningowym", points: 3 },
  { id: "2.17", title: "Organizacja i przeprowadzenie centralnego egzaminu językowego", points: 3 }
];

export const zajeciaJezykObcy = [
  { id: "3.1", title: "Wykłady dla studentów w ośrodku zagranicznym", points: 0.5, tooltip: "(np. Erasmus+)" },
  { id: "3.2", title: "Prowadzenie zajęć w języku obcym", points: 0.5, tooltip: "(np. Erasmus+)" },
  { id: "3.3", title: "Konsultacje ze studentami zagranicznymi w języku obcym", points: 0.5 }
];

export const funkcjeDydaktyczne = [
  { id: "4.1", title: "Członkostwo w Uczelnianej komisji ds. jakości kształcenia", points: 5 },
  { id: "4.2", title: "Członkostwo w Wydziałowej komisji ds. jakości kształcenia", points: 5 },
  { id: "4.3", title: "Opiekun praktyk studenckich", points: 3, tooltip: "(liczba pkt. uzależniona jest od liczby studentów)" },
  { id: "4.4", title: "Kierowanie edycją studiów podyplomowych", points: 3 }
];

export const nagrodyWyroznienia = [
  { id: "5.1", title: "Indywidualna lub zespołowa nagroda Ministra Edukacji i Nauki", points: 20 },
  { id: "5.2", title: "Promotorstwo nagrodzonych prac dyplomowych lub doktorskich", points: 2 }
];


export const zasadyPodzialuPunktow = [
  { id: "1", title: "Podział punktów pomiędzy autorów (lub wykonawców, opiekunów)", points: 1, tooltip: "Liczba punktów dzieli się przez liczbę autorów (lub wykonawców, opiekunów), uwzględniając doktorantów, nie uwzględniając studentów. Podział zależy od wkładu pracy." },
  { id: "2", title: "Publikacje zgłoszone do oceny aktywności naukowo-badawczej", points: 0, tooltip: "Nie można uwzględniać publikacji zgłoszonych do oceny aktywności naukowo-badawczej." },
  { id: "3", title: "Uwzględnienie funkcji wniosku aplikacyjnego", points: 1, tooltip: "Funkcja musi być uwzględniona we wniosku aplikacyjnym na realizację projektu." },
  { id: "4", title: "Finansowanie projektu ze środków zewnętrznych", points: 1, tooltip: "Projekt musi być finansowany ze środków zewnętrznych, aby punkty były przyznane." },
  { id: "5", title: "Przydział punktów przez kierownika projektu", points: 1, tooltip: "Liczbę punktów przydziela kierownik lub koordynator projektu lub zespołu." }
];
