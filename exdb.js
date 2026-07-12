/* RehabFlow — wspólna biblioteka ćwiczeń (używana przez index.html i fizjo.html) */
(function (root) {
  'use strict';

  const TYPE_EMOJI = { 'Siłowe':'🏋️', 'Rozciąganie':'🧘', 'Równowaga':'⚖️', 'Aerobowe':'🏃', 'Oddechowe':'🌬️', 'Mobilność':'🔄', 'Inne':'💫' };

  const LIB_GROUPS = [
    {id:'kolano',    name:'🦵 Kolano'},
    {id:'bark',      name:'💪 Bark'},
    {id:'kregoslup', name:'🧍 Kręgosłup'},
    {id:'kostka',    name:'🦶 Kostka'},
    {id:'ogolne',    name:'✨ Ogólne'},
  ];

  const EX_DB = [
    // KOLANO
    {id:'k1', g:'kolano', n:'Izometryczne napinanie uda',      t:'Siłowe',      r:10, s:3, d:'Usiądź z wyprostowaną nogą. Napnij mięsień uda, dociskając kolano do podłoża. Przytrzymaj 5 sekund, rozluźnij.'},
    {id:'k2', g:'kolano', n:'Unoszenie prostej nogi',          t:'Siłowe',      r:12, s:3, d:'Leżąc na plecach z jedną nogą zgiętą, unieś prostą nogę ok. 30 cm nad podłoże. Opuszczaj powoli i kontrolowanie.'},
    {id:'k3', g:'kolano', n:'Zginanie kolana na brzuchu',      t:'Mobilność',   r:12, s:3, d:'Leżąc na brzuchu, powoli zegnij kolano przyciągając piętę w stronę pośladka. Wracaj kontrolowanie.'},
    {id:'k4', g:'kolano', n:'Półprzysiad przy ścianie',        t:'Siłowe',      r:10, s:3, d:'Oprzyj plecy o ścianę, stopy ok. 40 cm od niej. Zsuwaj się do lekkiego zgięcia kolan (maks. 45°), przytrzymaj 5 s.'},
    {id:'k5', g:'kolano', n:'Wchodzenie na stopień',           t:'Siłowe',      r:10, s:3, d:'Wejdź chorą nogą na niski stopień, dostaw drugą nogę, zejdź. Kontroluj, by kolano nie uciekało do środka.'},
    {id:'k6', g:'kolano', n:'Rozciąganie tylnej grupy uda',    t:'Rozciąganie', r:3,  s:2, d:'Siedząc, wyprostuj nogę i pochyl się w jej stronę z prostymi plecami. Przytrzymaj 30 sekund.'},
    {id:'k7', g:'kolano', n:'Rozciąganie czworogłowego',       t:'Rozciąganie', r:3,  s:2, d:'Stojąc, chwyć stopę i przyciągnij piętę do pośladka. Kolana trzymaj razem. Przytrzymaj 30 sekund.'},
    {id:'k8', g:'kolano', n:'Odwodzenie nogi leżąc bokiem',    t:'Siłowe',      r:12, s:3, d:'Leżąc na boku, unieś prostą górną nogę ok. 40 cm. Opuszczaj powoli, nie odchylaj tułowia.'},
    {id:'k9', g:'kolano', n:'Mostek biodrowy',                 t:'Siłowe',      r:12, s:3, d:'Leżąc na plecach ze zgiętymi kolanami, unieś biodra do linii tułów-uda. Napnij pośladki u góry, przytrzymaj 3 s.'},
    {id:'k10',g:'kolano', n:'Krążenia kolana / rowerek',       t:'Aerobowe',    r:20, s:2, d:'Leżąc na plecach, wykonuj spokojne ruchy jak przy pedałowaniu. Płynnie, bez bólu.'},
    // BARK
    {id:'b1', g:'bark', n:'Wahadło Codmana',                   t:'Mobilność',   r:15, s:3, d:'Pochyl się, oprzyj zdrową rękę o stół. Rozluźnij chorą rękę i wykonuj małe okrężne ruchy jak wahadło.'},
    {id:'b2', g:'bark', n:'Wspinanie palcami po ścianie',      t:'Mobilność',   r:10, s:3, d:'Stań przodem do ściany. „Wspinaj się" palcami w górę tak wysoko, jak pozwala bark bez bólu, i wracaj.'},
    {id:'b3', g:'bark', n:'Rotacja zewnętrzna z gumą',         t:'Siłowe',      r:12, s:3, d:'Łokieć przy tułowiu zgięty 90°. Odciągaj gumę na zewnątrz, nie odrywając łokcia od ciała.'},
    {id:'b4', g:'bark', n:'Rotacja wewnętrzna z gumą',         t:'Siłowe',      r:12, s:3, d:'Łokieć przy tułowiu zgięty 90°. Przyciągaj gumę do brzucha, ruch tylko w stawie ramiennym.'},
    {id:'b5', g:'bark', n:'Ściąganie łopatek',                 t:'Siłowe',      r:12, s:3, d:'Siedząc lub stojąc, ściągnij łopatki w dół i do siebie. Przytrzymaj 5 sekund, rozluźnij.'},
    {id:'b6', g:'bark', n:'Unoszenie ramion w przód',          t:'Siłowe',      r:10, s:3, d:'Z lekkim ciężarem (0,5-1 kg) unoś proste ramię do wysokości barku. Opuszczaj powoli.'},
    {id:'b7', g:'bark', n:'Odwodzenie ramienia do 90°',        t:'Siłowe',      r:10, s:3, d:'Unoś proste ramię bokiem do wysokości barku, kciuk skierowany w górę. Powoli opuszczaj.'},
    {id:'b8', g:'bark', n:'Rozciąganie klatki w drzwiach',     t:'Rozciąganie', r:3,  s:2, d:'Oprzyj przedramiona o framugę drzwi, zrób mały krok w przód do uczucia rozciągania klatki. Przytrzymaj 30 s.'},
    {id:'b9', g:'bark', n:'Krążenia ramion',                   t:'Mobilność',   r:15, s:2, d:'Wykonuj powolne, szerokie krążenia ramion w przód i w tył. Płynny, kontrolowany ruch.'},
    {id:'b10',g:'bark', n:'Unoszenie kija nad głowę',          t:'Mobilność',   r:10, s:3, d:'Leżąc na plecach, chwyć kij oburącz i unieś go prostymi rękami za głowę tak daleko, jak to możliwe bez bólu.'},
    // KRĘGOSŁUP
    {id:'s1', g:'kregoslup', n:'Koci grzbiet',                 t:'Mobilność',   r:12, s:3, d:'W klęku podpartym naprzemiennie wyginaj plecy w górę (koci grzbiet) i opuszczaj w dół. Ruch płynny, z oddechem.'},
    {id:'s2', g:'kregoslup', n:'Martwy robak',                 t:'Siłowe',      r:10, s:3, d:'Leżąc na plecach, unieś nogi zgięte 90° i ręce w górę. Powoli opuszczaj przeciwną rękę i nogę, napinając brzuch.'},
    {id:'s3', g:'kregoslup', n:'Ptak-pies',                    t:'Równowaga',   r:10, s:3, d:'W klęku podpartym wyciągnij jednocześnie przeciwną rękę i nogę. Przytrzymaj 5 s, utrzymuj proste plecy.'},
    {id:'s4', g:'kregoslup', n:'Mostek',                       t:'Siłowe',      r:12, s:3, d:'Leżąc na plecach ze zgiętymi kolanami, unieś biodra. Napnij pośladki i brzuch, przytrzymaj 3 sekundy.'},
    {id:'s5', g:'kregoslup', n:'Kolana do klatki',             t:'Rozciąganie', r:3,  s:2, d:'Leżąc na plecach, przyciągnij oba kolana do klatki piersiowej. Przytrzymaj 30 sekund, oddychaj spokojnie.'},
    {id:'s6', g:'kregoslup', n:'Rotacje tułowia leżąc',        t:'Mobilność',   r:10, s:2, d:'Leżąc na plecach z kolanami zgiętymi, opuszczaj powoli złączone kolana raz na jedną, raz na drugą stronę.'},
    {id:'s7', g:'kregoslup', n:'Plank na przedramionach',      t:'Siłowe',      r:1,  s:3, m:'time', sec:30, d:'Utrzymaj prostą linię ciała w podporze na przedramionach. Nie unoś bioder.'},
    {id:'s8', g:'kregoslup', n:'Plank boczny',                 t:'Siłowe',      r:1,  s:2, m:'time', sec:20, d:'W podporze bokiem na przedramieniu utrzymaj prostą linię ciała. Po serii zmień stronę.'},
    {id:'s9', g:'kregoslup', n:'Rozciąganie zginaczy bioder',  t:'Rozciąganie', r:3,  s:2, d:'W wykroku z kolanem na podłodze przesuń biodra w przód do uczucia rozciągania. Przytrzymaj 30 sekund.'},
    {id:'s10',g:'kregoslup', n:'Pozycja dziecka',              t:'Rozciąganie', r:2,  s:2, d:'Usiądź na piętach, wyciągnij ręce daleko w przód, opuść klatkę do podłoża. Oddychaj głęboko 30-45 sekund.'},
    // KOSTKA
    {id:'a1', g:'kostka', n:'Krążenia stopy',                  t:'Mobilność',   r:15, s:3, d:'Siedząc, wykonuj powolne krążenia stopą w obu kierunkach. Pełny, bezbolesny zakres ruchu.'},
    {id:'a2', g:'kostka', n:'Zgięcie grzbietowe z gumą',       t:'Siłowe',      r:12, s:3, d:'Guma zaczepiona przed stopą. Przyciągaj palce stopy w swoją stronę pokonując opór gumy.'},
    {id:'a3', g:'kostka', n:'Zgięcie podeszwowe z gumą',       t:'Siłowe',      r:12, s:3, d:'Guma owinięta wokół śródstopia, trzymana w rękach. Odpychaj stopę jak przy wciskaniu gazu.'},
    {id:'a4', g:'kostka', n:'Alfabet stopą',                   t:'Mobilność',   r:1,  s:2, d:'Unieś stopę i „narysuj" w powietrzu wszystkie litery alfabetu, poruszając tylko stawem skokowym.'},
    {id:'a5', g:'kostka', n:'Wspięcia na palce',               t:'Siłowe',      r:15, s:3, d:'Stojąc (możesz przytrzymać się ściany), unieś się powoli na palce i jeszcze wolniej opuszczaj.'},
    {id:'a6', g:'kostka', n:'Stanie na jednej nodze',          t:'Równowaga',   r:1,  s:3, m:'time', sec:30, d:'Stań na chorej nodze i utrzymaj równowagę. Utrudnienie: zamknij oczy lub stań na poduszce.'},
    {id:'a7', g:'kostka', n:'Rozciąganie łydki przy ścianie',  t:'Rozciąganie', r:3,  s:2, d:'W wykroku przodem do ściany, tylna noga prosta z piętą na podłodze. Przytrzymaj 30 sekund.'},
    {id:'a8', g:'kostka', n:'Zbieranie ręcznika palcami',      t:'Siłowe',      r:10, s:2, d:'Siedząc, podciągaj palcami stopy rozłożony na podłodze ręcznik pod stopę.'},
    {id:'a9', g:'kostka', n:'Chód na piętach i palcach',       t:'Równowaga',   r:10, s:2, d:'Przejdź 10 kroków na piętach, potem 10 kroków na palcach. Powoli i kontrolowanie.'},
    // OGÓLNE
    {id:'g1', g:'ogolne', n:'Marsz w miejscu',                 t:'Aerobowe',    r:30, s:2, d:'Maszeruj w miejscu energicznie unosząc kolana. Utrzymuj wyprostowaną sylwetkę.'},
    {id:'g2', g:'ogolne', n:'Przysiad do krzesła',             t:'Siłowe',      r:10, s:3, d:'Stojąc przed krzesłem, usiądź powoli kontrolując ruch i wstań bez pomocy rąk (jeśli możliwe).'},
    {id:'g3', g:'ogolne', n:'Pompki przy ścianie',             t:'Siłowe',      r:10, s:3, d:'Oprzyj dłonie o ścianę na wysokości barków. Uginaj ramiona zbliżając klatkę do ściany i odpychaj się.'},
    {id:'g4', g:'ogolne', n:'Skłony boczne',                   t:'Rozciąganie', r:10, s:2, d:'Stojąc, przesuwaj dłoń wzdłuż uda w dół, pochylając tułów w bok. Druga ręka nad głową.'},
    {id:'g5', g:'ogolne', n:'Oddychanie przeponowe',           t:'Oddechowe',   r:8,  s:2, d:'Leżąc, połóż dłoń na brzuchu. Wdychaj nosem tak, by unosił się brzuch (nie klatka). Wydychaj powoli ustami.'},
    {id:'g6', g:'ogolne', n:'Krążenia bioder',                 t:'Mobilność',   r:12, s:2, d:'Stojąc z rękami na biodrach, wykonuj szerokie krążenia biodrami w obu kierunkach.'},
    {id:'g7', g:'ogolne', n:'Rozciąganie karku',               t:'Rozciąganie', r:3,  s:2, d:'Przechyl głowę do barku, delikatnie dociągnij dłonią. Przytrzymaj 20 sekund na każdą stronę.'},
    {id:'g8', g:'ogolne', n:'Wykroki w miejscu',               t:'Siłowe',      r:8,  s:2, d:'Zrób krok w przód i ugnij oba kolana do 90°. Kolano przednie nad stopą. Wróć i zmień nogę.'},
  ];

  const PROGRAMS = [
    {id:'kolano',    icon:'🦵', name:'Kolano po urazie',       desc:'Wzmacnianie i mobilność stawu kolanowego', ex:['k1','k2','k3','k4','k6','k7','k9','k10']},
    {id:'bark',      icon:'💪', name:'Bark i obręcz barkowa',  desc:'Odzyskiwanie zakresu ruchu i siły barku',  ex:['b1','b2','b3','b4','b5','b8','b9','b10']},
    {id:'kregoslup', icon:'🧍', name:'Kręgosłup lędźwiowy',    desc:'Stabilizacja i uelastycznienie pleców',    ex:['s1','s2','s3','s4','s5','s6','s9','s10']},
    {id:'kostka',    icon:'🦶', name:'Skręcona kostka',        desc:'Mobilność, siła i równowaga stawu skokowego', ex:['a1','a2','a3','a5','a6','a7','a8','a9']},
    {id:'wlasny',    icon:'✏️', name:'Własny program',         desc:'Zacznij od pustej listy i dodaj ćwiczenia samodzielnie', ex:[]},
  ];

  /* tłumaczenia EN biblioteki: id → [nazwa, opis] (PL pozostaje źródłem w EX_DB) */
  const EX_EN = {
    k1: ['Isometric quad sets', 'Sit with your leg straight. Tighten the thigh muscle, pressing the knee toward the floor. Hold 5 seconds, relax.'],
    k2: ['Straight leg raise', 'Lying on your back with one knee bent, lift the straight leg about 30 cm off the floor. Lower slowly and with control.'],
    k3: ['Prone knee bend', 'Lying on your stomach, slowly bend the knee, bringing the heel toward the buttock. Return with control.'],
    k4: ['Wall half squat', 'Lean your back against a wall, feet ~40 cm away. Slide down to a slight knee bend (max 45°), hold 5 s.'],
    k5: ['Step-ups', 'Step onto a low step with the injured leg, bring the other leg up, step down. Keep the knee from caving inward.'],
    k6: ['Hamstring stretch', 'Sitting, straighten the leg and lean toward it with a straight back. Hold 30 seconds.'],
    k7: ['Quadriceps stretch', 'Standing, grab your foot and pull the heel toward the buttock. Keep knees together. Hold 30 seconds.'],
    k8: ['Side-lying leg abduction', 'Lying on your side, lift the straight top leg about 40 cm. Lower slowly without tilting the torso.'],
    k9: ['Glute bridge', 'Lying on your back with knees bent, lift your hips into a straight torso-thigh line. Squeeze the glutes at the top, hold 3 s.'],
    k10: ['Knee circles / bicycle', 'Lying on your back, make calm pedalling movements. Smooth and pain-free.'],
    b1: ['Codman pendulum', 'Bend forward, rest your healthy arm on a table. Relax the injured arm and make small circular pendulum movements.'],
    b2: ['Wall finger walk', 'Face a wall. "Walk" your fingers up as high as the shoulder allows without pain, then back down.'],
    b3: ['External rotation with band', 'Elbow at your side bent 90°. Pull the band outward without lifting the elbow off your body.'],
    b4: ['Internal rotation with band', 'Elbow at your side bent 90°. Pull the band toward your belly, moving only at the shoulder joint.'],
    b5: ['Scapular squeezes', 'Sitting or standing, pull your shoulder blades down and together. Hold 5 seconds, relax.'],
    b6: ['Front arm raise', 'With a light weight (0.5–1 kg), raise the straight arm to shoulder height. Lower slowly.'],
    b7: ['Arm abduction to 90°', 'Raise the straight arm sideways to shoulder height, thumb pointing up. Lower slowly.'],
    b8: ['Doorway chest stretch', 'Rest your forearms on a door frame, take a small step forward until you feel a chest stretch. Hold 30 s.'],
    b9: ['Arm circles', 'Make slow, wide arm circles forward and backward. Smooth, controlled motion.'],
    b10: ['Overhead stick raise', 'Lying on your back, hold a stick with both hands and raise it with straight arms overhead as far as possible without pain.'],
    s1: ['Cat-cow', 'On all fours, alternately arch your back up (cat) and lower it down. Smooth movement with your breath.'],
    s2: ['Dead bug', 'Lying on your back, raise legs bent 90° and arms up. Slowly lower the opposite arm and leg, bracing your core.'],
    s3: ['Bird-dog', 'On all fours, extend the opposite arm and leg at the same time. Hold 5 s, keep your back straight.'],
    s4: ['Bridge', 'Lying on your back with knees bent, lift your hips. Squeeze glutes and core, hold 3 seconds.'],
    s5: ['Knees to chest', 'Lying on your back, pull both knees to your chest. Hold 30 seconds, breathe calmly.'],
    s6: ['Lying trunk rotations', 'Lying on your back with knees bent, slowly lower both knees to one side, then the other.'],
    s7: ['Forearm plank', 'Hold a straight body line supported on your forearms for 20–30 seconds. Do not raise your hips.'],
    s8: ['Side plank', 'In a side support on your forearm, hold a straight body line 15–20 seconds per side.'],
    s9: ['Hip flexor stretch', 'In a lunge with the back knee on the floor, shift your hips forward until you feel a stretch. Hold 30 seconds.'],
    s10: ["Child's pose", 'Sit on your heels, reach your arms far forward, lower your chest to the floor. Breathe deeply 30–45 seconds.'],
    a1: ['Ankle circles', 'Sitting, make slow foot circles in both directions. Full, pain-free range of motion.'],
    a2: ['Dorsiflexion with band', "Band anchored in front of the foot. Pull your toes toward you against the band's resistance."],
    a3: ['Plantarflexion with band', 'Band wrapped around the forefoot, held in your hands. Push the foot away like pressing a gas pedal.'],
    a4: ['Alphabet with the foot', 'Lift the foot and "draw" all the letters of the alphabet in the air, moving only the ankle.'],
    a5: ['Calf raises', 'Standing (hold a wall if needed), rise slowly onto your toes and lower even more slowly.'],
    a6: ['Single-leg balance', 'Stand on the injured leg and keep your balance for 30 seconds. Harder: close your eyes or stand on a pillow.'],
    a7: ['Wall calf stretch', 'In a lunge facing a wall, back leg straight with the heel on the floor. Hold 30 seconds.'],
    a8: ['Towel scrunches', 'Sitting, use your toes to pull a towel spread on the floor under your foot.'],
    a9: ['Heel and toe walking', 'Walk 10 steps on your heels, then 10 steps on your toes. Slowly and with control.'],
    g1: ['Marching in place', 'March energetically in place, lifting your knees. Keep an upright posture.'],
    g2: ['Sit-to-stand', 'Standing in front of a chair, sit down slowly with control and stand up without using your hands (if possible).'],
    g3: ['Wall push-ups', 'Place your hands on a wall at shoulder height. Bend your arms bringing your chest toward the wall, then push back.'],
    g4: ['Side bends', 'Standing, slide your hand down along your thigh, bending the torso sideways. Other arm overhead.'],
    g5: ['Diaphragmatic breathing', 'Lying down, place a hand on your belly. Inhale through the nose so the belly rises (not the chest). Exhale slowly through the mouth.'],
    g6: ['Hip circles', 'Standing with hands on hips, make wide hip circles in both directions.'],
    g7: ['Neck stretch', 'Tilt your head toward your shoulder, gently assist with your hand. Hold 20 seconds per side.'],
    g8: ['Lunges in place', 'Step forward and bend both knees to 90°. Front knee over the foot. Return and switch legs.'],
  };

  const PROGRAMS_EN = {
    kolano:    ['Knee after injury', 'Strengthening and mobility of the knee joint'],
    bark:      ['Shoulder & shoulder girdle', 'Restoring shoulder range of motion and strength'],
    kregoslup: ['Lumbar spine', 'Back stabilisation and flexibility'],
    kostka:    ['Sprained ankle', 'Ankle mobility, strength and balance'],
    wlasny:    ['Custom program', 'Start with an empty list and add exercises yourself'],
  };

  /* nazwa/opis ćwiczenia w bieżącym języku (RFI18N opcjonalny — bez niego PL) */
  function exName(e) {
    if (typeof RFI18N !== 'undefined' && RFI18N.getLang() === 'en' && EX_EN[e.id]) return EX_EN[e.id][0];
    return e.n;
  }
  function exDesc(e) {
    if (typeof RFI18N !== 'undefined' && RFI18N.getLang() === 'en' && EX_EN[e.id]) return EX_EN[e.id][1];
    return e.d;
  }

  const api = { TYPE_EMOJI, LIB_GROUPS, EX_DB, PROGRAMS, EX_EN, PROGRAMS_EN, exName, exDesc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.RFExDB = api; root.TYPE_EMOJI = TYPE_EMOJI; root.LIB_GROUPS = LIB_GROUPS; root.EX_DB = EX_DB; root.PROGRAMS = PROGRAMS; root.EX_EN = EX_EN; root.PROGRAMS_EN = PROGRAMS_EN; root.exName = exName; root.exDesc = exDesc; }
})(typeof self !== 'undefined' ? self : this);
