// Zasady podziału punktów - pomocnicze definicje
export const zasadyPodzialuPunktow = [
	{
		id: '1',
		title:
			'Liczbę punktów dzieli się przez liczbę autorów (lub wykonawców, opiekunów) z uwzględnieniem doktorantów, nie uwzględnia się studentów; proporcjonalnie do wkładu pracy, podział punktów według uzgodnień współautorów (wykonawców, opiekunów)',
	},
	{ id: '2', title: 'Nie można uwzględniać publikacji zgłoszonych do oceny aktywności naukowo-badawczej' },
	{ id: '3', title: 'O ile funkcja ta została uwzględniona we wniosku aplikacyjnym na realizację projektu' },
	{ id: '4', title: 'Finansowanego ze środków zewnętrznych' },
	{ id: '5', title: 'Liczbę punktów przydziela kierownik/koordynator projektu/zespołu' },
]

// Wszystkie pytania w jednej tablicy z dodanym polem category
export const allQuestions = [
	// Publikacje dydaktyczne
	{
		id: '1.1',
		title: 'Autorstwo podręcznika akademickiego w języku obcym',
		points: 40,
		tooltip: [
			'Liczbę punktów dzieli się przez liczbę autorów (lub wykonawców, opiekunów) z uwzględnieniem doktorantów, nie uwzględnia się studentów; proporcjonalnie do wkładu pracy, podział punktów według uzgodnień współautorów (wykonawców, opiekunów)',
		],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.2',
		title: 'Autorstwo podręcznika akademickiego w języku polskim',
		points: 30,
		tooltip: [
			'Liczbę punktów dzieli się przez liczbę autorów (lub wykonawców, opiekunów) z uwzględnieniem doktorantów, nie uwzględnia się studentów; proporcjonalnie do wkładu pracy, podział punktów według uzgodnień współautorów (wykonawców, opiekunów)',
		],
		category: 'Publikacje dydaktyczne',
	},
	{ id: '1.3', title: 'Autorstwo skryptu', points: 20, tooltip: [], category: 'Publikacje dydaktyczne' },
	{
		id: '1.4',
		title: 'Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)',
		points: 'Punktacja wg systemu bibliotecznego',
		tooltip: [],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.5',
		title: 'Tłumaczenie podręcznika akademickiego na język polski',
		points: 15,
		tooltip: [],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.6',
		title: 'Tłumaczenie skryptu na język polski',
		points: 10,
		tooltip: [],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.7',
		title: 'Autorstwo wspólnych publikacji ze studentami (artykuł)',
		points: 5,
		tooltip: ['za sam fakt włączenia studentów w przygotowanie publikacji'],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.8',
		title: 'Autorstwo rozdziału w podręczniku akademickim',
		points: 5,
		tooltip: [],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.9',
		title: 'Autorstwo publikacji metodycznej lub popularnonaukowej',
		points: 3,
		tooltip: [
			'Liczbę punktów dzieli się przez liczbę autorów (lub wykonawców, opiekunów) z uwzględnieniem doktorantów, nie uwzględnia się studentów; proporcjonalnie do wkładu pracy, podział punktów według uzgodnień współautorów (wykonawców, opiekunów)',
		],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.10',
		title: 'Recenzja podręcznika akademickiego lub szkolnego',
		points: 5,
		tooltip: [],
		category: 'Publikacje dydaktyczne',
	},
	{
		id: '1.11',
		title: 'Redakcja wydawnictwa zwartego zawierającego recenzowane publikacje studentów',
		points: 10,
		tooltip: [],
		category: 'Publikacje dydaktyczne',
	},

	// Podniesienie jakości nauczania
	{
		id: '2.1',
		title: 'Koordynator/Kierownik międzynarodowego projektu dydaktycznego',
		points: 10,
		tooltip: ['maksymalnie 5 osób w zespole', 'do 10 pkt. na osobę na rok'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.2',
		title: 'Koordynator/Kierownik wniosku o finansowanie międzynarodowego projektu dydaktycznego',
		points: 10,
		tooltip: ['maksymalnie 5 osób w zespole', 'jednorazowo do 10 pkt. na osobę'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.3',
		title: 'Koordynator/Kierownik krajowego projektu dydaktycznego',
		points: 8,
		tooltip: ['maksymalnie 3 osoby w zespole', 'do 8 pkt. na osobę na rok'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.4',
		title: 'Koordynator/Kierownik wniosku o finansowanie krajowego projektu dydaktycznego',
		points: 8,
		tooltip: ['maksymalnie 3 osoby w zespole', 'jednorazowo do 8 pkt. na osobę'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.5',
		title: 'Opracowanie i wdrożenie nowej specjalności studiów',
		points: 5,
		tooltip: ['maksymalnie 4 osoby w zespole', 'jednorazowo do 5 pkt. na osobę'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.6',
		title: 'Autorstwo i realizacja programu nowego przedmiotu',
		points: 2,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.7',
		title: 'Nowe stanowisko do zajęć laboratoryjnych lub program komputerowy',
		points: 5,
		tooltip: ['zapewnienie instrukcji laboratoryjnej lub projektowej', 'jednorazowo'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.8',
		title: 'Przygotowanie lub modyfikacja programu nowych studiów podyplomowych',
		points: 8,
		tooltip: ['maksymalnie 2 osoby w zespole', 'jednorazowo do 8 pkt. na osobę'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.9',
		title: 'Przygotowanie programów nowych kursów specjalistycznych',
		points: 5,
		tooltip: ['maksymalnie 2 osoby w zespole', 'jednorazowo do 5 pkt. na osobę'],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.10',
		title: 'Jakość prowadzenia zajęć dydaktycznych (arkusze hospitacji)',
		points: 'Zależy od średniej ocen uzyskanych w okresie oceny',
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.11',
		title: 'Jakość prowadzenia zajęć dydaktycznych (ankiety studenckie i doktoranckie)',
		points: 'Zależy od uzyskanej średniej ocen',
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.12',
		title: 'Promotorstwo prac dyplomowych licencjackich lub inżynierskich',
		points: 2,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.13',
		title: 'Promotorstwo prac dyplomowych magisterskich',
		points: 3,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.14',
		title: 'Przygotowanie recenzji prac licencjackich, inżynierskich lub magisterskich',
		points: 0.5,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.15',
		title: 'Prowadzenie dodatkowych zajęć sportowych',
		points: 5,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.16',
		title: 'Przygotowanie przedmiotu w systemie e-learningowym',
		points: 3,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},
	{
		id: '2.17',
		title: 'Organizacja i przeprowadzenie centralnego egzaminu językowego',
		points: 3,
		tooltip: [],
		category: 'Podniesienie jakości nauczania',
	},

	// Zajęcia w języku obcym, wykłady za granicą
	{
		id: '3.1',
		title: 'Wykłady dla studentów w ośrodku zagranicznym',
		points: 0.5,
		tooltip: ['np. Erasmus+'],
		category: 'Zajęcia w języku obcym, wykłady za granicą',
	},
	{
		id: '3.2',
		title: 'Prowadzenie zajęć w języku obcym',
		points: 0.5,
		tooltip: ['np. Erasmus+'],
		category: 'Zajęcia w języku obcym, wykłady za granicą',
	},
	{
		id: '3.3',
		title: 'Konsultacje ze studentami zagranicznymi w języku obcym',
		points: 0.5,
		tooltip: [],
		category: 'Zajęcia w języku obcym, wykłady za granicą',
	},

	// Pełnienie funkcji dydaktycznej (za każdy rok)
	{
		id: '4.1',
		title: 'Członkostwo w Uczelnianej komisji ds. jakości kształcenia',
		points: 5,
		tooltip: [],
		category: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
	},
	{
		id: '4.2',
		title: 'Członkostwo w Wydziałowej komisji ds. jakości kształcenia',
		points: 5,
		tooltip: [],
		category: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
	},
	{
		id: '4.3',
		title: 'Opiekun praktyk studenckich',
		points: 3,
		tooltip: ['liczba pkt. uzależniona jest od liczby studentów'],
		category: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
	},
	{
		id: '4.4',
		title: 'Kierowanie edycją studiów podyplomowych',
		points: 3,
		tooltip: [],
		category: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
	},

	// Nagrody i wyróżnienia
	{
		id: '5.1',
		title: 'Indywidualna lub zespołowa nagroda Ministra Edukacji i Nauki',
		points: 20,
		tooltip: [],
		category: 'Nagrody i wyróznienia',
	},
	{
		id: '5.2',
		title: 'Promotorstwo nagrodzonych prac dyplomowych lub doktorskich',
		points: 2,
		tooltip: [],
		category: 'Nagrody i wyróznienia',
	},
]

// Zachowujemy stare tablice dla kompatybilności wstecznej
export const publikacjeDydaktyczne = allQuestions.filter(q => q.category === 'Publikacje dydaktyczne')
export const podniesienieJakosciNauczania = allQuestions.filter(q => q.category === 'Podniesienie jakości nauczania')
export const zajeciaJezykObcy = allQuestions.filter(q => q.category === 'Zajęcia w języku obcym, wykłady za granicą')
export const funkcjeDydaktyczne = allQuestions.filter(
	q => q.category === 'Pełnienie funkcji dydaktycznej (za każdy rok)'
)
export const nagrodyWyroznienia = allQuestions.filter(q => q.category === 'Nagrody i wyróznienia')
