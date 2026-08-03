(function () {
  'use strict';

  /* ═══════════════════════════════════════
     BILINGUAL HELPERS
     ═══════════════════════════════════════ */
  function L(es, en) { return { es: es, en: en }; }
  function lang() { return document.documentElement.lang || 'es'; }
  function t(obj) { return obj ? (obj[lang()] || obj.es || '') : ''; }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function nl2p(text) {
    return text.split('\n\n').map(function (p) { return '<p class="ob-text">' + p + '</p>'; }).join('');
  }

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Screen-reader announcement via a persistent live region
  function announce(msg) {
    var live = $('#obLive');
    if (!live) return;
    live.textContent = '';
    // Defer so consecutive updates are re-announced by assistive tech
    setTimeout(function () { live.textContent = msg; }, 60);
  }

  function fbPrefix(ok) {
    return ok ? (lang() === 'es' ? 'Correcto. ' : 'Correct. ')
              : (lang() === 'es' ? 'Incorrecto. ' : 'Incorrect. ');
  }

  // Attach both click and keyboard (Enter/Space) activation to non-button elements
  function onActivate(el, fn) {
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        fn.call(this, e);
      }
    });
  }

  // Keyboard flows (steps 3 & 7) re-render innerHTML, which drops focus to <body>.
  // Set _refocus before a re-render to restore focus to an equivalent element after it.
  var _refocus = null;
  function applyRefocus(root) {
    if (!_refocus) return;
    var target = typeof _refocus === 'function' ? _refocus(root) : root.querySelector(_refocus);
    _refocus = null;
    if (target && target.focus) target.focus();
  }

  /* ═══════════════════════════════════════
     CONTENT
     ═══════════════════════════════════════ */
  var C = {
    welcome: {
      title: L('Antes de empezar, necesitas conocer ICS', 'Before you start, you need to know ICS'),
      lead: L(
        'Esta experiencia te va a llevar por todo lo que necesitas entender sobre Immigration Case Support: qué hacemos, qué no hacemos, cómo trabajamos y por qué importa cada parte. Vas a leer, practicar y al final, demostrar que lo tienes claro.',
        'This experience will walk you through everything you need to understand about Immigration Case Support: what we do, what we don\'t do, how we work, and why each part matters. You\'ll read, practice, and at the end, demonstrate that it\'s clear.'
      ),
      placeholder: L('Tu nombre', 'Your name')
    },

    // STEP 1
    s1: {
      label: L('Lectura 1 de 9', 'Reading 1 of 9'),
      title: L('ICS en una frase', 'ICS in one sentence'),
      read: L(
        'ICS escribe los documentos que necesita un caso de inmigración basado en trauma, con un ojo clínico que entiende cómo el trauma desordena la memoria.\n\nDicho de otra manera: ayudamos a que la historia de una persona quede bien escrita en los documentos que su caso de inmigración necesita.\n\nEso es todo. No somos un despacho de abogados, no somos una clínica. Somos el equipo que convierte una historia fragmentada por el trauma en documentación clara, estructurada y con la profundidad que USCIS exige.',
        'ICS writes the documents an immigration case based on trauma needs, with a clinical eye that understands how trauma disrupts memory.\n\nPut another way: we help a person\'s story get properly written into the documents their immigration case needs.\n\nThat\'s it. We\'re not a law firm, we\'re not a clinic. We\'re the team that turns a trauma-fragmented story into clear, structured documentation with the depth USCIS demands.'
      ),
      practiceLabel: L('Verifica tu comprensión', 'Verify your understanding'),
      quiz: {
        prompt: L(
          'Completa la frase: ICS escribe los documentos que necesita un caso de inmigración basado en trauma, con un ojo clínico que entiende cómo el trauma...',
          'Complete the sentence: ICS writes the documents an immigration case based on trauma needs, with a clinical eye that understands how trauma...'
        ),
        options: [
          { text: L('...causa dolor emocional', '...causes emotional pain'), correct: false },
          { text: L('...desordena la memoria', '...disrupts memory'), correct: true },
          { text: L('...impide la comunicación', '...prevents communication'), correct: false },
          { text: L('...genera desconfianza', '...generates distrust'), correct: false }
        ],
        correctFeedback: L('El trauma desordena la memoria. Esa es la razón de ser de ICS: documentar con un enfoque clínico que entiende esa fragmentación.', 'Trauma disrupts memory. That\'s the reason ICS exists: documenting with a clinical approach that understands that fragmentation.'),
        incorrectFeedback: L('No exactamente. El punto clave es que el trauma desordena la memoria, y por eso hace falta un enfoque clínico para documentar bien.', 'Not exactly. The key point is that trauma disrupts memory, and that\'s why a clinical approach is needed for proper documentation.')
      }
    },

    // STEP 2
    s2: {
      label: L('Lectura 2 de 9', 'Reading 2 of 9'),
      title: L('El problema que resuelve', 'The problem ICS solves'),
      read: L(
        'USCIS revisa hoy con más dureza que nunca. Una documentación mediocre ya no es solo débil, es motivo activo de rechazo. Un buen documento necesita una cronología sólida, los hechos relevantes bien identificados y evidencia que respalde cada uno.\n\nCuando el caso involucra trauma hay una capa extra. El trauma fragmenta el relato, desordena la memoria, esconde los hechos importantes. La persona no está mintiendo ni siendo inconsistente: su cerebro proceso la experiencia de una forma que hace difícil contarla en orden.\n\nPor eso hace falta un ojo clínico. Alguien que vea a traves de esa fragmentación, identifique lo relevante, y reconstruya la historia con la profundidad y estructura que el caso necesita. Eso es exactamente lo que aplica ICS.',
        'USCIS reviews more strictly today than ever. Mediocre documentation is no longer just weak — it\'s an active reason for denial. A strong document needs a solid chronology, well-identified relevant facts, and evidence backing each one.\n\nWhen trauma is involved there\'s an extra layer. Trauma fragments the narrative, disrupts memory, and hides important facts. The person isn\'t lying or being inconsistent: their brain processed the experience in a way that makes it hard to tell in order.\n\nThat\'s why a clinical eye is needed. Someone who can see through that fragmentation, identify what\'s relevant, and reconstruct the story with the depth and structure the case needs. That\'s exactly what ICS does.'
      ),
      practiceLabel: L('Verdadero o falso', 'True or false'),
      quiz: [
        {
          text: L('Una documentación mediocre hoy puede ser motivo activo de rechazo por USCIS.', 'Mediocre documentation today can be an active reason for denial by USCIS.'),
          answer: true,
          feedback: L('USCIS revisa con más dureza que nunca. Lo mediocre ya no pasa.', 'USCIS reviews more strictly than ever. Mediocre no longer passes.')
        },
        {
          text: L('El trauma hace que la persona recuerde los hechos con más claridad.', 'Trauma causes the person to remember facts more clearly.'),
          answer: false,
          feedback: L('Al reves. El trauma fragmenta el relato y desordena la memoria.', 'The opposite. Trauma fragments the narrative and disrupts memory.')
        },
        {
          text: L('Una narrativa fragmentada indica que la historia es inconsistente.', 'A fragmented narrative indicates the story is inconsistent.'),
          answer: false,
          feedback: L('No. Una narrativa fragmentada es un efecto del trauma, no una señal de inconsistencia.', 'No. A fragmented narrative is an effect of trauma, not a sign of inconsistency.')
        }
      ]
    },

    // STEP 3
    s3: {
      label: L('Lectura 3 de 9', 'Reading 3 of 9'),
      title: L('Qué hace ICS exactamente', 'What ICS does exactly'),
      read: L(
        'ICS produce tres tipos de documento:\n\nDeclaración jurada (Affidavit) — formal, cronológica, lista para el caso.\n\nPersonal Statement — el testimonio en la voz de la persona, menos formal que un affidavit pero igual de estructurado.\n\nCartas de carácter (Character Letters) — cartas de apoyo de la familia, la pareja, los empleadores y la comunidad, consistentes entre sí.\n\nY ofrece tres servicios:\n\nSesión de Narrativa — se trabaja la historia del cliente a profundidad. Es el punto de partida de casi todo caso.\n\nAuto-preparación (Case Self-Preparation) — acompañamiento paso a paso para quien presenta su propio caso, con guía de alcance limitado de un abogado de inmigración que trabaja como contratista independiente.\n\nEvaluación psicológica — evaluación clínica formal hecha por un profesional de salud mental bilingüe con licencia.',
        'ICS produces three types of documents:\n\nSworn Declaration (Affidavit) — formal, chronological, case-ready.\n\nPersonal Statement — testimony in the person\'s voice, less formal than an affidavit but equally structured.\n\nCharacter Letters — support letters from family, partner, employers, and community, consistent with each other.\n\nAnd offers three services:\n\nNarrative Session — the client\'s story is explored in depth. It\'s the starting point for almost every case.\n\nCase Self-Preparation — step-by-step guidance for those filing their own case, with limited-scope guidance from an immigration attorney working as an independent contractor.\n\nPsychological Evaluation — formal clinical evaluation by a licensed bilingual mental health professional.'
      ),
      practiceLabel: L('Clasifica cada elemento', 'Classify each item'),
      quiz: {
        prompt: L('Arrastra cada elemento a su categoría, o toca para seleccionar y luego toca la zona destino.', 'Drag each item to its category, or tap to select then tap the target zone.'),
        items: [
          { text: L('Affidavit', 'Affidavit'), category: 'doc' },
          { text: L('Sesión de Narrativa', 'Narrative Session'), category: 'service' },
          { text: L('Personal Statement', 'Personal Statement'), category: 'doc' },
          { text: L('Auto-preparación', 'Case Self-Preparation'), category: 'service' },
          { text: L('Cartas de carácter', 'Character Letters'), category: 'doc' },
          { text: L('Evaluación psicológica', 'Psychological Evaluation'), category: 'service' }
        ],
        zones: { doc: L('Documentos', 'Documents'), service: L('Servicios', 'Services') }
      }
    },

    // STEP 4
    s4: {
      label: L('Lectura 4 de 9', 'Reading 4 of 9'),
      title: L('Qué NO hace ICS', 'What ICS does NOT do'),
      read: L(
        'Esta es la regla del scope y es innegociable. Cada vez que describes ICS tienes que decir también lo que no hace:\n\nNo llena formularios oficiales de inmigración.\nNo presenta casos ante USCIS.\nNo da asesoría legal.\nNo es un despacho de abogados.\n\nEsto protege al cliente de expectativas mal calibradas y a ICS regulatoriamente. Cuando se omite, aparecen los malentendidos más difíciles de resolver.\n\nHay tres límites adicionales en la comunicación que nunca se cruzan: no comunicar desde el miedo, no prometer resultados migratorios, y no exagerar el alcance de lo que hacemos.',
        'This is the scope rule and it\'s non-negotiable. Every time you describe ICS you must also say what it doesn\'t do:\n\nDoes not fill out official immigration forms.\nDoes not file cases before USCIS.\nDoes not provide legal advice.\nIs not a law firm.\n\nThis protects the client from miscalibrated expectations and ICS from regulatory issues. When it\'s omitted, the hardest misunderstandings to resolve appear.\n\nThere are three additional communication limits that are never crossed: don\'t communicate from fear, don\'t promise immigration outcomes, and don\'t exaggerate the scope of what we do.'
      ),
      practiceLabel: L('Escenarios de juicio', 'Judgment scenarios'),
      quiz: [
        {
          situation: L('Un cliente te pide que le llenes el formulario I-485.', 'A client asks you to fill out Form I-485.'),
          options: [
            { text: L('Lo lleno porque es parte del servicio.', 'I fill it out because it\'s part of the service.'), correct: false },
            { text: L('Le explico que ICS no llena formularios oficiales y lo refiero a su abogado.', 'I explain that ICS doesn\'t fill out official forms and refer them to their attorney.'), correct: true },
            { text: L('Lo lleno pero sin firmarlo.', 'I fill it out but don\'t sign it.'), correct: false }
          ],
          feedback: L('ICS nunca llena formularios oficiales de inmigración, sin excepciones.', 'ICS never fills out official immigration forms, no exceptions.')
        },
        {
          situation: L('Un familiar del cliente pregunta: "Creen que le van a aprobar el caso?"', 'A client\'s family member asks: "Do you think their case will be approved?"'),
          options: [
            { text: L('Le digo que sí para darle tranquilidad.', 'I say yes to reassure them.'), correct: false },
            { text: L('Le explico que ICS no puede prometer ni predecir resultados migratorios.', 'I explain that ICS cannot promise or predict immigration outcomes.'), correct: true },
            { text: L('Le digo que probablemente sí, pero que no es seguro.', 'I say probably yes, but it\'s not certain.'), correct: false }
          ],
          feedback: L('ICS nunca promete resultados migratorios.', 'ICS never promises immigration outcomes.')
        },
        {
          situation: L('Un abogado te pide que presentes directamente los documentos ante USCIS.', 'An attorney asks you to file documents directly with USCIS.'),
          options: [
            { text: L('Lo hago como cortesía profesional.', 'I do it as a professional courtesy.'), correct: false },
            { text: L('Le explico que ICS prepara la documentación pero no presenta casos.', 'I explain that ICS prepares documentation but doesn\'t file cases.'), correct: true }
          ],
          feedback: L('ICS prepara documentación. La presentación ante USCIS la hace el abogado.', 'ICS prepares documentation. Filing with USCIS is done by the attorney.')
        },
        {
          situation: L('Alguien pregunta si ICS puede aconsejarle sobre qué tipo de visa solicitar.', 'Someone asks if ICS can advise them on what type of visa to apply for.'),
          options: [
            { text: L('Le doy mi opinión basada en experiencia.', 'I give my opinión based on experience.'), correct: false },
            { text: L('Le explico que ICS no da asesoría legal y lo refiero a un abogado de inmigración.', 'I explain that ICS doesn\'t provide legal advice and refer them to an immigration attorney.'), correct: true }
          ],
          feedback: L('Dar orientación sobre tipos de visa es asesoría legal. ICS no lo hace.', 'Guidance on visa types is legal advice. ICS doesn\'t do that.')
        }
      ]
    },

    // STEP 5
    s5: {
      label: L('Lectura 5 de 9', 'Reading 5 of 9'),
      title: L('Qué hace diferente a ICS', 'What makes ICS different'),
      read: L(
        'ICS combina formación certificada en trauma con experiencia paralegal migratoria. Los proveedores clínicos no conocen el proceso legal, los legales no tienen formación en trauma. Son pocos los que juntan las dos cosas.\n\nEl enfoque trauma-informado no es un servicio aparte, es cómo se trabaja siempre: reconstruir una cronología desordenada, separar lo importante del contexto secundario, cuidar el ritmo emocional del cliente. Está en cada documento.\n\nSe trabaja en el idioma del cliente, sin traducciones intermedias. Los detalles importantes salen mejor cuando la persona cuenta su historia en su propio idioma.\n\nEl resultado es documentación que refleja la profundidad de lo que la persona vivió, con la estructura que un oficial o un juez necesitan para tomar el caso en serio.',
        'ICS combines certified trauma training with immigration paralegal experience. Clinical providers don\'t know the legal process, legal professionals don\'t have trauma training. Few combine both.\n\nThe trauma-informed approach isn\'t a separate service — it\'s how work is always done: reconstructing a disordered chronology, separating the important from secondary context, managing the client\'s emotional pace. It\'s in every document.\n\nWork is done in the client\'s language, without intermediate translations. Important details come through better when the person tells their story in their own language.\n\nThe result is documentation that reflects the depth of what the person lived, with the structure an officer or judge needs to take the case seriously.'
      ),
      practiceLabel: L('Selecciona las que apliquen', 'Select all that apply'),
      quiz: {
        prompt: L('Marca las afirmaciones que son verdaderas sobre ICS:', 'Select the statements that are true about ICS:'),
        options: [
          { text: L('Combina formación en trauma con experiencia paralegal migratoria.', 'Combines trauma training with immigration paralegal experience.'), correct: true },
          { text: L('El enfoque trauma-informado es un servicio adicional con costo extra.', 'The trauma-informed approach is an additional service with extra cost.'), correct: false },
          { text: L('Se trabaja en el idioma del cliente, sin traducciones intermedias.', 'Work is done in the client\'s language, without intermediate translations.'), correct: true },
          { text: L('ICS compite directamente con despachos de abogados.', 'ICS competes directly with law firms.'), correct: false },
          { text: L('La documentación refleja la profundidad de la experiencia vivida.', 'Documentation reflects the depth of the lived experience.'), correct: true },
          { text: L('ICS ofrece representación legal cuando el cliente no tiene abogado.', 'ICS offers legal representation when the client has no attorney.'), correct: false },
          { text: L('El enfoque trauma-informado está presente en cada documento, no es opcional.', 'The trauma-informed approach is present in every document, it\'s not optional.'), correct: true },
          { text: L('ICS trabaja únicamente en ingles.', 'ICS works only in English.'), correct: false }
        ]
      }
    },

    // STEP 6
    s6: {
      label: L('Lectura 6 de 9', 'Reading 6 of 9'),
      title: L('Dónde se ubica ICS', 'Where ICS sits'),
      read: L(
        'ICS no compite con despachos de abogados ni con clínicas psicológicas. Vive en el espacio entre lo clínico y lo legal: la preparación documental de casos con trauma.\n\nEs una categoría nueva. Los proveedores clínicos hacen evaluaciones pero no conocen la estructura que un caso de inmigración necesita. Los abogados conocen el proceso legal pero no tienen formación para trabajar con narrativas fracturadas por trauma. ICS ocupa ese espacio intermedio.\n\nICS quiere ser el nombre con el que se identifique esta categoría. No somos ni un lado ni el otro. Somos el puente documental entre ambos.',
        'ICS doesn\'t compete with law firms or psychological clinics. It lives in the space between clinical and legal: trauma case document preparation.\n\nIt\'s a new category. Clinical providers do evaluations but don\'t know the structure an immigration case needs. Attorneys know the legal process but don\'t have training to work with trauma-fractured narratives. ICS occupies that middle space.\n\nICS wants to be the name this category is identified with. We\'re not one side or the other. We\'re the documentary bridge between both.'
      ),
      practiceLabel: L('Ubicación visual', 'Visual placement'),
      quiz: {
        prompt: L('Haz clic en la zona donde se ubica ICS.', 'Click the zone where ICS sits.'),
        zones: [
          { id: 'clinical', label: L('Clínico', 'Clinical'), sub: L('Evaluaciones, diagnósticos', 'Evaluations, diagnoses'), correct: false },
          { id: 'middle', label: L('Entre clínico y legal', 'Between clinical and legal'), sub: L('Preparación documental', 'Document preparation'), correct: true },
          { id: 'legal', label: L('Legal', 'Legal'), sub: L('Representación, formularios', 'Representation, forms'), correct: false }
        ],
        correctFeedback: L('ICS vive entre lo clínico y lo legal: preparación documental de casos con trauma.', 'ICS lives between clinical and legal: trauma case document preparation.'),
        incorrectFeedback: L('ICS no es ni clínico ni legal. Vive en el espacio entre ambos.', 'ICS is neither clinical nor legal. It lives in the space between both.')
      }
    },

    // STEP 7
    s7: {
      label: L('Lectura 7 de 9', 'Reading 7 of 9'),
      title: L('Cómo trabaja ICS por dentro', 'How ICS works internally'),
      readPrinciples: [
        L('Primero comprender, después documentar. Nunca se empieza escribiendo.', 'First understand, then document. Never start by writing.'),
        L('El trauma cambia cómo se recuerda. Una narrativa fragmentada no significa una historia inconsistente.', 'Trauma changes how things are remembered. A fragmented narrative doesn\'t mean an inconsistent story.'),
        L('El contexto pesa tanto como los hechos. Un dato aislado puede sostener o debilitar según cómo se enmarque.', 'Context weighs as much as facts. An isolated fact can strengthen or weaken depending on how it\'s framed.'),
        L('Documentar no es transcribir. Es organizar, conectar y estructurar la información para que se entienda.', 'Documenting is not transcribing. It\'s organizing, connecting, and structuring information so it makes sense.'),
        L('La estrategia legal necesita una base documental sólida. ICS fortalece esa base, no compite con el abogado.', 'Legal strategy needs a solid documentary foundation. ICS strengthens that foundation — it doesn\'t compete with the attorney.')
      ],
      readFlow: [
        L('Primer contacto', 'First contact'),
        L('Intake rápido (se confirma el servicio correcto)', 'Quick intake (confirm the right service)'),
        L('Sesión de Narrativa o recepción de materiales', 'Narrative Session or materials reception'),
        L('Redacción y estructura', 'Writing and structuring'),
        L('Revisión con el cliente', 'Review with client'),
        L('Entrega lista para presentar', 'Delivery ready for filing')
      ],
      readRoles: [
        L('Clínicos con licencia: conducen la sesión y hacen la lectura clínica del trauma.', 'Licensed clinicians: conduct the session and perform the clinical reading of trauma.'),
        L('Especialistas de narrativa y paralegal: reconstruyen la cronología y redactan.', 'Narrative and paralegal specialists: reconstruct the chronology and write.'),
        L('Abogado externo (solo auto-preparación): guía de alcance limitado.', 'External attorney (self-preparation only): limited-scope guidance.'),
        L('El abogado del cliente, cuando existe, es siempre externo a ICS.', 'The client\'s attorney, when they have one, is always external to ICS.')
      ],
      practiceLabel: L('Ordena el flujo', 'Order the flow'),
      quiz: {
        prompt: L('Ordena los pasos del flujo típico de un caso. Arrastra o toca dos elementos para intercambiarlos.', 'Order the steps of the typical case flow. Drag or tap two items to swap them.')
      }
    },

    // STEP 8
    s8: {
      label: L('Lectura 8 de 9', 'Reading 8 of 9'),
      title: L('La oferta B2B: Clinical Narrative Workup', 'The B2B offer: Clinical Narrative Workup'),
      read: L(
        'ICS le ofrece a los abogados de inmigración un workup de narrativa clínica sin costo sobre uno de sus casos activos de trauma.\n\nIncluye la sesión completa, el paquete clínico (mapa narrativo, lectura de trauma y affidavit redactado) y una llamada de revisión.\n\nEs una muestra del proceso completo para que el abogado lo vea antes de decidir. Todo lo que se produce queda con el abogado, continue con nosotros o no. No hay condiciones, no hay letra pequeña.',
        'ICS offers immigration attorneys a clinical narrative workup at no cost on one of their active trauma cases.\n\nIt includes the full session, the clinical package (narrative map, trauma reading, and drafted affidavit), and a review call.\n\nIt\'s a sample of the full process for the attorney to see before deciding. Everything produced stays with the attorney, whether they continue with us or not. No conditions, no fine print.'
      ),
      practiceLabel: L('Verifica tu comprensión', 'Verify your understanding'),
      quiz: [
        {
          prompt: L('Qué incluye el Clinical Narrative Workup?', 'What does the Clinical Narrative Workup include?'),
          options: [
            { text: L('Solo la sesión de narrativa.', 'Only the narrative session.'), correct: false },
            { text: L('Sesión completa, paquete clínico y llamada de revisión.', 'Full session, clinical package, and review call.'), correct: true },
            { text: L('Un diagnóstico clínico del cliente.', 'A clinical diagnosis of the client.'), correct: false }
          ],
          feedback: L('Incluye la sesión, el paquete clínico completo y una llamada de revisión.', 'It includes the session, the full clinical package, and a review call.')
        },
        {
          prompt: L('Si el abogado decide no continuar con ICS, qué pasa con lo producido?', 'If the attorney decides not to continue with ICS, what happens to what was produced?'),
          options: [
            { text: L('Se elimina por confidencialidad.', 'It\'s deleted for confidentiality.'), correct: false },
            { text: L('Todo queda con el abogado.', 'Everything stays with the attorney.'), correct: true },
            { text: L('Se cobra retroactivamente.', 'It\'s charged retroactively.'), correct: false }
          ],
          feedback: L('Todo lo producido queda con el abogado, continue o no.', 'Everything produced stays with the attorney, whether they continue or not.')
        }
      ]
    },

    // STEP 9
    s9: {
      label: L('Lectura 9 de 9', 'Reading 9 of 9'),
      title: L('Cómo suena ICS', 'How ICS sounds'),
      read: L(
        'El tono sigue siempre la misma secuencia: educar, explicar, argumentar, y solo entonces presentar. Nunca se abre vendiendo.\n\nLa voz es cálida sin ser familiar, precisa sin ser fría, segura sin ser arrogante. Ni alarmista ni condescendiente.\n\nTres límites que no se cruzan:\n\nNo comunicar desde el miedo.\nNo prometer resultados migratorios.\nNo exagerar el alcance de lo que hacemos.',
        'The tone always follows the same sequence: educate, explain, argue, and only then present. Never open by selling.\n\nThe voice is warm without being casual, precise without being cold, confident without being arrogant. Neither alarmist nor condescending.\n\nThree limits that are never crossed:\n\nDon\'t communicate from fear.\nDon\'t promise immigration outcomes.\nDon\'t exaggerate the scope of what we do.'
      ),
      practiceLabel: L('Reconoce el tono', 'Recognize the tone'),
      quiz: {
        prompt: L('Lee cada mensaje y decide si suena a ICS o no.', 'Read each message and decide if it sounds like ICS or not.'),
        samples: [
          {
            text: L('"Entendemos que contar tu historia puede ser difícil. Nuestro trabajo es asegurarnos de que quede escrita con la claridad y profundidad que tu caso necesita."', '"We understand that telling your story can be difficult. Our job is to make sure it\'s written with the clarity and depth your case needs."'),
            isICS: true,
            feedback: L('Cálido, preciso, no promete resultados.', 'Warm, precise, doesn\'t promise outcomes.')
          },
          {
            text: L('"Si no actúas AHORA podrías perder tu caso para siempre. Contáctanos antes de que sea demasiado tarde."', '"If you don\'t act NOW you could lose your case forever. Contact us before it\'s too late."'),
            isICS: false,
            feedback: L('Comunica desde el miedo. Alarmista. ICS nunca suena así.', 'Communicates from fear. Alarmist. ICS never sounds like this.')
          },
          {
            text: L('"Garantizamos que con nuestro servicio tu caso será aprobado. Tenemos un 99% de éxito."', '"We guarantee that with our service your case will be approved. We have a 99% success rate."'),
            isICS: false,
            feedback: L('Promete resultados migratorios y exagera el alcance. Dos límites rotos.', 'Promises immigration outcomes and exaggerates scope. Two limits broken.')
          },
          {
            text: L('"La documentación sólida no gana un caso por sí sola, pero le da al abogado las herramientas que necesita para presentar un argumento fuerte."', '"Strong documentation doesn\'t win a case by itself, but it gives the attorney the tools needed to present a strong argument."'),
            isICS: true,
            feedback: L('Reconoce los límites de la documentación sin minimizar su valor.', 'Acknowledges documentation\'s limits without minimizing its value.')
          }
        ]
      }
    },

    assessment: {
      title: L('Evaluación final', 'Final assessment'),
      text: L('Necesitas 8 de 10 respuestas correctas para aprobar. Si no lo logras, puedes reintentar.', 'You need 8 out of 10 correct answers to pass. If you don\'t make it, you can retry.'),
      pass: L('Aprobado', 'Passed'),
      fail: L('No aprobado', 'Not passed'),
      passMsg: L('Tienes claro qué es ICS y cómo trabajamos.', 'You\'re clear on what ICS is and how we work.'),
      failMsg: L('Revisa las secciones donde fallaste y vuelve a intentarlo.', 'Review the sections where you failed and try again.')
    },

    certificate: {
      title: L('Onboarding completado', 'Onboarding complete'),
      subtitle: L('Certificado de comprensión', 'Certificate of understanding'),
      body: L(
        'ha completado el onboarding de Immigration Case Support y ha demostrado comprensión del alcance, los servicios, los límites y el método de trabajo de ICS.',
        'has successfully completed the Immigration Case Support onboarding and has demonstrated understanding of the scope, services, limits, and working method of ICS.'
      )
    },

    nav: {
      prev: L('Anterior', 'Previous'),
      next: L('Siguiente', 'Next'),
      check: L('Verificar', 'Check'),
      start: L('Comenzar', 'Start'),
      submit: L('Enviar', 'Submit'),
      retry: L('Reintentar', 'Retry'),
      certificate: L('Ver certificado', 'View certificate'),
      print: L('Imprimir', 'Print')
    },

    ui: {
      assessmentShort: L('Evaluación', 'Assessment'),
      true: L('Verdadero', 'True'),
      false: L('Falso', 'False'),
      of: L('de', 'of'),
      fivePrinciples: L('Cinco principios', 'Five principles'),
      caseFlow: L('Flujo típico de un caso', 'Typical case flow'),
      roles: L('Roles', 'Roles'),
      soundsLikeICS: L('Suena a ICS', 'Sounds like ICS'),
      notSoundsLikeICS: L('No suena a ICS', 'Doesn\'t sound like ICS'),
      perfect: L('Perfecto.', 'Perfect.'),
      correctInGreen: L('Los correctos están en verde.', 'Correct ones are in green.'),
      correctOrderGreen: L('El orden correcto está señalado en verde.', 'The correct order is shown in green.')
    }
  };

  /* ═══════════════════════════════════════
     ASSESSMENT BANK
     ═══════════════════════════════════════ */
  var BANK = [
    { s:1, q: L('Qué entiende el ojo clínico de ICS?', 'What does ICS\'s clinical eye understand?'), o: [
      { text: L('Cómo el trauma desordena la memoria', 'How trauma disrupts memory'), c: true },
      { text: L('Cómo funciona el sistema legal', 'How the legal system works'), c: false },
      { text: L('Cómo escribir formularios', 'How to fill out forms'), c: false }
    ]},
    { s:2, q: L('Una narrativa fragmentada por trauma indica que:', 'A trauma-fragmented narrative indicates that:'), o: [
      { text: L('La persona miente', 'The person is lying'), c: false },
      { text: L('El trauma afectó cómo se recuerda', 'Trauma affected how things are remembered'), c: true },
      { text: L('La historia es inconsistente', 'The story is inconsistent'), c: false }
    ]},
    { s:3, q: L('Cuál de estos es un documento que produce ICS?', 'Which of these is a document ICS produces?'), o: [
      { text: L('Formulario I-485', 'Form I-485'), c: false },
      { text: L('Declaración jurada (Affidavit)', 'Sworn Declaration (Affidavit)'), c: true },
      { text: L('Orden judicial', 'Court order'), c: false }
    ]},
    { s:3, q: L('La Sesión de Narrativa es:', 'The Narrative Session is:'), o: [
      { text: L('Un servicio donde se trabaja la historia del cliente a profundidad', 'A service where the client\'s story is explored in depth'), c: true },
      { text: L('Un documento formal para el caso', 'A formal case document'), c: false },
      { text: L('Una evaluación legal', 'A legal evaluation'), c: false }
    ]},
    { s:4, q: L('Un cliente pide que ICS le aconseje qué visa solicitar. Qué haces?', 'A client asks ICS to advise them on which visa to apply for. What do you do?'), o: [
      { text: L('Le doy orientación general', 'I give general guidance'), c: false },
      { text: L('Le explico que ICS no da asesoría legal y lo refiero a un abogado', 'I explain ICS doesn\'t give legal advice and refer them to an attorney'), c: true }
    ]},
    { s:4, q: L('Por qué es innegociable comunicar lo que ICS NO hace?', 'Why is it non-negotiable to communicate what ICS does NOT do?'), o: [
      { text: L('Protege al cliente y a ICS regulatoriamente', 'It protects the client and ICS from regulatory issues'), c: true },
      { text: L('Es una formalidad sin importancia practica', 'It\'s a formality with no practical importance'), c: false }
    ]},
    { s:5, q: L('El enfoque trauma-informado de ICS es:', 'ICS\'s trauma-informed approach is:'), o: [
      { text: L('Un servicio adicional con costo', 'An additional paid service'), c: false },
      { text: L('La forma en que se trabaja siempre', 'The way work is always done'), c: true },
      { text: L('Solo para casos de asilo', 'Only for asylum cases'), c: false }
    ]},
    { s:6, q: L('ICS se ubica:', 'ICS sits:'), o: [
      { text: L('En el espacio clínico', 'In the clinical space'), c: false },
      { text: L('Entre lo clínico y lo legal', 'Between clinical and legal'), c: true },
      { text: L('En el espacio legal', 'In the legal space'), c: false }
    ]},
    { s:7, q: L('Cuál es el primer paso del flujo de trabajo?', 'What is the first step in the workflow?'), o: [
      { text: L('Redacción y estructura', 'Writing and structuring'), c: false },
      { text: L('Primer contacto', 'First contact'), c: true },
      { text: L('Sesión de Narrativa', 'Narrative Session'), c: false }
    ]},
    { s:8, q: L('Si un abogado recibe el Workup pero no continua con ICS:', 'If an attorney receives the Workup but doesn\'t continue with ICS:'), o: [
      { text: L('Debe devolver los materiales', 'They must return the materials'), c: false },
      { text: L('Todo lo producido queda con el abogado', 'Everything produced stays with the attorney'), c: true },
      { text: L('Se le cobra el servicio', 'They are charged for the service'), c: false }
    ]},
    { s:9, q: L('Cuál es la secuencia del tono de ICS?', 'What is the sequence for ICS\'s tone?'), o: [
      { text: L('Vender, explicar, cerrar', 'Sell, explain, close'), c: false },
      { text: L('Educar, explicar, argumentar, presentar', 'Educate, explain, argue, present'), c: true },
      { text: L('Presentar, argumentar, educar', 'Present, argue, educate'), c: false }
    ]},
    { s:9, q: L('ICS puede prometer resultados migratorios si la evidencia es fuerte.', 'ICS can promise immigration outcomes if the evidence is strong.'), o: [
      { text: L('Verdadero', 'True'), c: false },
      { text: L('Falso', 'False'), c: true }
    ]}
  ];

  /* ═══════════════════════════════════════
     STATE
     ═══════════════════════════════════════ */
  var S = {
    step: 0,
    total: 11,
    name: '',
    done: {},
    // per-step state stored as S._s1, S._s2, etc.
    aQ: [],
    aA: {},
    aScore: -1
  };

  /* ═══════════════════════════════════════
     PERSISTENCE
     ═══════════════════════════════════════ */
  var STORAGE_KEY = 'ics-onboarding-v1';

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: lang(), S: S }));
    } catch (e) { /* storage unavailable / full — fail silently */ }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
  }

  /* ═══════════════════════════════════════
     PROGRESS & NAV
     ═══════════════════════════════════════ */
  function updateProgress() {
    var pct = (S.step / S.total) * 100;
    $('#progressLine').style.width = pct + '%';
    var counter = $('#stepCounter');
    if (S.step === 0 || S.step === 11) {
      counter.textContent = '';
    } else if (S.step === 10) {
      counter.textContent = t(C.ui.assessmentShort);
    } else {
      counter.textContent = S.step + ' / 9';
    }
  }

  function updateNav() {
    var prev = $('#prevBtn');
    var next = $('#nextBtn');

    prev.style.visibility = S.step === 0 ? 'hidden' : 'visible';
    prev.textContent = t(C.nav.prev);

    if (S.step === 0) {
      next.textContent = t(C.nav.start);
      next.disabled = !S.name.trim();
    } else if (S.step === 10) {
      next.textContent = t(C.nav.submit);
      next.disabled = false;
    } else if (S.step === 11) {
      next.style.display = 'none';
      prev.style.display = 'none';
    } else {
      next.style.display = '';
      next.textContent = t(C.nav.next);
      next.disabled = !S.done[S.step];
    }

    var reset = $('#resetBtn');
    if (reset) reset.hidden = S.step === 0;
    saveState();
  }

  function goTo(n) {
    if (n < 0 || n > S.total) return;
    $$('.ob-step').forEach(function (el) { el.classList.remove('ob-step--active'); });
    S.step = n;
    var target = $('[data-step="' + n + '"]');
    if (target) {
      target.classList.add('ob-step--active');
      render(n);
      focusStep(target, n);
    }
    updateProgress();
    updateNav();
    saveState();
  }

  // Move keyboard/screen-reader focus to the new step's heading (welcome keeps input focus)
  function focusStep(target, n) {
    if (n === 0) return;
    var h = target.querySelector('.ob-title');
    if (h) {
      h.setAttribute('tabindex', '-1');
      h.focus();
    }
  }

  /* ═══════════════════════════════════════
     RENDER DISPATCH
     ═══════════════════════════════════════ */
  var RENDER_FNS = [rWelcome, r1, r2, r3, r4, r5, r6, r7, r8, r9, rAssessment, rCertificate];

  function render(n) {
    if (RENDER_FNS[n]) RENDER_FNS[n]();
  }

  /* ── Step 0: Welcome ── */
  function rWelcome() {
    var el = $('#content-0');
    var d = C.welcome;
    el.innerHTML =
      '<div class="ob-welcome">' +
        '<p class="ob-section-label">Onboarding</p>' +
        '<h1 class="ob-title">' + t(d.title) + '</h1>' +
        '<p class="ob-text ob-text--secondary">' + t(d.lead) + '</p>' +
        '<input type="text" class="ob-welcome__input" id="nameInput" placeholder="' + esc(t(d.placeholder)) + '" value="' + esc(S.name || '') + '" autocomplete="name">' +
      '</div>';
    var input = $('#nameInput');
    input.addEventListener('input', function () { S.name = this.value; updateNav(); });
    input.focus();
  }

  /* ── Generic read panel ── */
  function writeRead(n, label, title, bodyHtml) {
    var el = $('#read-' + n);
    el.innerHTML = '<p class="ob-section-label">' + t(label) + '</p>' +
      '<h2 class="ob-title">' + t(title) + '</h2>' + bodyHtml;
  }

  /* ── Step 1 ── */
  function r1() {
    var d = C.s1;
    writeRead(1, d.label, d.title, nl2p(t(d.read)));

    var el = $('#practice-1');
    if (S.done[1]) {
      renderMCResult(el, d, S._s1Answer);
      return;
    }
    el.innerHTML = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p>' +
      '<div class="ob-options">' + d.quiz.options.map(function (o, i) {
        return '<button class="ob-option" data-i="' + i + '"><span class="ob-option__indicator"></span><span>' + t(o.text) + '</span></button>';
      }).join('') + '</div><div class="ob-feedback" id="fb1"></div>';

    $$('.ob-option', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(this.getAttribute('data-i'));
        S._s1Answer = i;
        S.done[1] = true;
        var ok1 = d.quiz.options[i].correct;
        renderMCResult(el, d, i);
        announce(fbPrefix(ok1) + t(ok1 ? d.quiz.correctFeedback : d.quiz.incorrectFeedback));
        updateNav();
      });
    });
  }

  function renderMCResult(el, d, answer) {
    var correct = d.quiz.options[answer].correct;
    el.innerHTML = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p>' +
      '<div class="ob-options">' + d.quiz.options.map(function (o, i) {
        var cls = 'ob-option';
        if (o.correct) cls += ' ob-option--correct';
        else if (i === answer) cls += ' ob-option--incorrect';
        return '<button class="' + cls + '"><span class="ob-option__indicator"></span><span>' + t(o.text) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (correct ? 'correct' : 'incorrect') + '">' +
      t(correct ? d.quiz.correctFeedback : d.quiz.incorrectFeedback) + '</div>';
  }

  /* ── Step 2: True/False ── */
  function r2() {
    var d = C.s2;
    writeRead(2, d.label, d.title, nl2p(t(d.read)));

    if (!S._s2) S._s2 = {};
    var el = $('#practice-2');
    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>';

    d.quiz.forEach(function (q, qi) {
      var answered = S._s2[qi] !== undefined;
      html += '<div style="margin-bottom:1.5rem"><p class="ob-quiz-prompt">' + t(q.text) + '</p>' +
        '<div class="ob-options" style="flex-direction:row;gap:0.5rem">';
      [true, false].forEach(function (val) {
        var label = val ? t(C.ui.true) : t(C.ui.false);
        var cls = 'ob-option';
        if (answered) {
          if (val === q.answer) cls += ' ob-option--correct';
          else if (S._s2[qi] === val) cls += ' ob-option--incorrect';
        }
        html += '<button class="' + cls + '" data-qi="' + qi + '" data-v="' + val + '" style="flex:1"><span class="ob-option__indicator"></span><span>' + label + '</span></button>';
      });
      html += '</div>';
      if (answered) {
        html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (S._s2[qi] === q.answer ? 'correct' : 'incorrect') + '">' + t(q.feedback) + '</div>';
      }
      html += '</div>';
    });

    el.innerHTML = html;

    $$('.ob-option:not(.ob-option--correct):not(.ob-option--incorrect)', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qi2 = parseInt(this.getAttribute('data-qi'));
        var val2 = this.getAttribute('data-v') === 'true';
        S._s2[qi2] = val2;
        announce(fbPrefix(val2 === d.quiz[qi2].answer) + t(d.quiz[qi2].feedback));
        if (Object.keys(S._s2).length === d.quiz.length) { S.done[2] = true; updateNav(); }
        r2();
      });
    });
  }

  /* ── Step 3: Drag & drop ── */
  function r3() {
    var d = C.s3;
    writeRead(3, d.label, d.title, nl2p(t(d.read)));

    if (!S._s3p) S._s3p = { doc: [], service: [] };
    if (!S._s3pool) S._s3pool = shuffle(d.quiz.items.map(function (_, i) { return i; }));

    var el = $('#practice-3');
    var placed = S._s3p.doc.concat(S._s3p.service);
    var remaining = S._s3pool.filter(function (i) { return placed.indexOf(i) === -1; });
    var checked = S.done[3];

    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p>' +
      '<div class="ob-drag-pool" id="pool3">';
    remaining.forEach(function (i) {
      var sel = S._s3sel === i ? ' ob-drag-item--selected' : '';
      html += '<div class="ob-drag-item' + sel + '" data-i="' + i + '" draggable="true" role="button" tabindex="0" aria-pressed="' + (S._s3sel === i) + '">' + t(d.quiz.items[i].text) + '</div>';
    });
    html += '</div><div class="ob-drop-zones">';
    ['doc', 'service'].forEach(function (cat) {
      html += '<div class="ob-drop-zone" data-z="' + cat + '" role="button" tabindex="0" aria-label="' + esc(t(d.quiz.zones[cat])) + '"><div class="ob-drop-zone__title">' + t(d.quiz.zones[cat]) + '</div><div class="ob-drop-zone__items">';
      S._s3p[cat].forEach(function (i) {
        var item = d.quiz.items[i];
        var cls = checked ? (item.category === cat ? ' ob-drag-item--correct' : ' ob-drag-item--incorrect') : '';
        html += '<div class="ob-drag-item' + cls + '">' + t(item.text) + '</div>';
      });
      html += '</div></div>';
    });
    html += '</div>';

    if (!checked && remaining.length === 0 && placed.length === d.quiz.items.length) {
      html += '<button class="ob-btn ob-btn--primary ob-btn--sm" id="chk3" style="margin-top:1rem">' + t(C.nav.check) + '</button>';
    }
    if (checked) {
      var ok = true;
      ['doc', 'service'].forEach(function (cat) { S._s3p[cat].forEach(function (i) { if (d.quiz.items[i].category !== cat) ok = false; }); });
      html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (ok ? 'correct' : 'incorrect') + '">' +
        (ok ? t(C.ui.perfect) : t(C.ui.correctInGreen)) + '</div>';
    }

    el.innerHTML = html;

    if (!checked) {
      // Drag events
      $$('#pool3 .ob-drag-item', el).forEach(function (item) {
        onActivate(item, function () {
          var idx = parseInt(this.getAttribute('data-i'));
          S._s3sel = S._s3sel === idx ? null : idx;
          _refocus = '#pool3 .ob-drag-item[data-i="' + idx + '"]';
          saveState();
          r3();
        });
        item.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('text/plain', this.getAttribute('data-i'));
          this.classList.add('ob-drag-item--dragging');
        });
        item.addEventListener('dragend', function () { this.classList.remove('ob-drag-item--dragging'); });
      });

      $$('.ob-drop-zone', el).forEach(function (zone) {
        zone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('ob-drop-zone--hover'); });
        zone.addEventListener('dragleave', function () { this.classList.remove('ob-drop-zone--hover'); });
        zone.addEventListener('drop', function (e) {
          e.preventDefault(); this.classList.remove('ob-drop-zone--hover');
          var idx = parseInt(e.dataTransfer.getData('text/plain'));
          if (!isNaN(idx)) { S._s3p[this.getAttribute('data-z')].push(idx); S._s3sel = null; saveState(); r3(); }
        });
        onActivate(zone, function (e) {
          if (S._s3sel != null && !(e && e.target && e.target.closest && e.target.closest('.ob-drag-item'))) {
            S._s3p[this.getAttribute('data-z')].push(S._s3sel);
            S._s3sel = null;
            _refocus = function (root) { return root.querySelector('#pool3 .ob-drag-item') || root.querySelector('#chk3') || root.querySelector('.ob-drop-zone'); };
            saveState();
            r3();
          }
        });
      });

      var chk = $('#chk3');
      if (chk) chk.addEventListener('click', function () {
        S.done[3] = true;
        var ok3 = true;
        ['doc', 'service'].forEach(function (cat) { S._s3p[cat].forEach(function (i) { if (d.quiz.items[i].category !== cat) ok3 = false; }); });
        announce(fbPrefix(ok3) + t(ok3 ? C.ui.perfect : C.ui.correctInGreen));
        _refocus = function () { return document.getElementById('nextBtn'); };
        saveState();
        updateNav();
        r3();
      });
    }

    applyRefocus(el);
  }

  /* ── Step 4: Scenarios ── */
  function r4() {
    var d = C.s4;
    writeRead(4, d.label, d.title, nl2p(t(d.read)));

    if (!S._s4) S._s4 = {};
    var el = $('#practice-4');
    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>';

    d.quiz.forEach(function (sc, si) {
      var answered = S._s4[si] !== undefined;
      html += '<div class="ob-scenario"><p class="ob-scenario__situation">' + t(sc.situation) + '</p><div class="ob-options">';
      sc.options.forEach(function (o, oi) {
        var cls = 'ob-option';
        if (answered) { if (o.correct) cls += ' ob-option--correct'; else if (S._s4[si] === oi) cls += ' ob-option--incorrect'; }
        html += '<button class="' + cls + '" data-si="' + si + '" data-oi="' + oi + '"><span class="ob-option__indicator"></span><span>' + t(o.text) + '</span></button>';
      });
      html += '</div>';
      if (answered) {
        html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (sc.options[S._s4[si]].correct ? 'correct' : 'incorrect') + '">' + t(sc.feedback) + '</div>';
      }
      html += '</div>';
    });

    el.innerHTML = html;
    $$('.ob-option:not(.ob-option--correct):not(.ob-option--incorrect)', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var si4 = parseInt(this.getAttribute('data-si'));
        var oi4 = parseInt(this.getAttribute('data-oi'));
        S._s4[si4] = oi4;
        announce(fbPrefix(d.quiz[si4].options[oi4].correct) + t(d.quiz[si4].feedback));
        if (Object.keys(S._s4).length === d.quiz.length) { S.done[4] = true; updateNav(); }
        r4();
      });
    });
  }

  /* ── Step 5: Select all ── */
  function r5() {
    var d = C.s5;
    writeRead(5, d.label, d.title, nl2p(t(d.read)));

    if (!S._s5) S._s5 = {};
    var el = $('#practice-5');
    var checked = S._s5checked;

    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p><div class="ob-options">';

    d.quiz.options.forEach(function (o, i) {
      var cls = 'ob-option';
      if (checked) { if (o.correct) cls += ' ob-option--correct'; else if (S._s5[i]) cls += ' ob-option--incorrect'; }
      else if (S._s5[i]) cls += ' ob-option--selected';
      html += '<button class="' + cls + '" data-i="' + i + '"><span class="ob-option__indicator ob-option__indicator--check"></span><span>' + t(o.text) + '</span></button>';
    });
    html += '</div>';

    if (!checked) {
      html += '<button class="ob-btn ob-btn--primary ob-btn--sm" id="chk5" style="margin-top:1rem">' + t(C.nav.check) + '</button>';
    } else {
      var ok = d.quiz.options.every(function (o, i) { return o.correct === !!S._s5[i]; });
      html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (ok ? 'correct' : 'incorrect') + '">' +
        (ok ? t(C.ui.perfect) : t(C.ui.correctInGreen)) + '</div>';
    }

    el.innerHTML = html;

    if (!checked) {
      $$('.ob-option', el).forEach(function (btn) {
        btn.addEventListener('click', function () { var i = parseInt(this.getAttribute('data-i')); S._s5[i] = !S._s5[i]; r5(); });
      });
      var chk = $('#chk5');
      if (chk) chk.addEventListener('click', function () {
        S._s5checked = true; S.done[5] = true;
        var ok5 = d.quiz.options.every(function (o, i) { return o.correct === !!S._s5[i]; });
        announce(fbPrefix(ok5) + t(ok5 ? C.ui.perfect : C.ui.correctInGreen));
        r5(); updateNav();
      });
    }
  }

  /* ── Step 6: Placement ── */
  function r6() {
    var d = C.s6;
    writeRead(6, d.label, d.title, nl2p(t(d.read)));

    var el = $('#practice-6');
    var answered = S._s6 !== undefined;

    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p>' +
      '<div class="ob-placement">';

    d.quiz.zones.forEach(function (z) {
      var cls = 'ob-placement__zone ob-placement__zone--' + z.id;
      if (answered) { if (z.correct) cls += ' ob-placement__zone--correct'; else if (S._s6 === z.id) cls += ' ob-placement__zone--incorrect'; }
      html += '<div class="' + cls + '" data-z="' + z.id + '" role="button" tabindex="0" aria-label="' + esc(t(z.label) + ' — ' + t(z.sub)) + '">' +
        '<span class="ob-placement__label">' + t(z.label) + '</span>' +
        '<span class="ob-placement__sublabel">' + t(z.sub) + '</span></div>';
    });
    html += '</div>';

    if (answered) {
      var ok = S._s6 === 'middle';
      html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (ok ? 'correct' : 'incorrect') + '">' +
        t(ok ? d.quiz.correctFeedback : d.quiz.incorrectFeedback) + '</div>';
    }

    el.innerHTML = html;

    if (!answered) {
      $$('.ob-placement__zone', el).forEach(function (zone) {
        onActivate(zone, function () {
          S._s6 = this.getAttribute('data-z'); S.done[6] = true;
          var ok6 = S._s6 === 'middle';
          announce(fbPrefix(ok6) + t(ok6 ? d.quiz.correctFeedback : d.quiz.incorrectFeedback));
          r6(); updateNav();
        });
      });
    }
  }

  /* ── Step 7: Sequence ── */
  function r7() {
    var d = C.s7;
    // Read panel
    var readHtml = '<p class="ob-section-label">' + t(d.label) + '</p><h2 class="ob-title">' + t(d.title) + '</h2>' +
      '<h3 class="ob-subtitle">' + t(C.ui.fivePrinciples) + '</h3>' +
      '<ol class="ob-principles">' + d.readPrinciples.map(function (p) { return '<li>' + t(p) + '</li>'; }).join('') + '</ol>' +
      '<h3 class="ob-subtitle">' + t(C.ui.caseFlow) + '</h3>' +
      '<ol class="ob-list">' + d.readFlow.map(function (s) { return '<li>' + t(s) + '</li>'; }).join('') + '</ol>' +
      '<h3 class="ob-subtitle">' + t(C.ui.roles) + '</h3>' +
      '<ul class="ob-list">' + d.readRoles.map(function (r) { return '<li>' + t(r) + '</li>'; }).join('') + '</ul>';
    $('#read-7').innerHTML = readHtml;

    // Practice
    if (!S._s7) S._s7 = shuffle([0,1,2,3,4,5]);
    var checked = S._s7checked;
    var el = $('#practice-7');

    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p><div class="ob-sequence" id="seq7">';

    S._s7.forEach(function (orig, pos) {
      var cls = 'ob-sequence__item';
      if (checked) cls += orig === pos ? ' ob-sequence__item--correct' : ' ob-sequence__item--incorrect';
      html += '<div class="' + cls + '" data-orig="' + orig + '" draggable="true" role="button" tabindex="0" aria-label="' + esc((pos + 1) + '. ' + t(d.readFlow[orig])) + '">' +
        '<span class="ob-sequence__num">' + (pos + 1) + '</span><span>' + t(d.readFlow[orig]) + '</span></div>';
    });
    html += '</div>';

    if (!checked) {
      html += '<button class="ob-btn ob-btn--primary ob-btn--sm" id="chk7" style="margin-top:1rem">' + t(C.nav.check) + '</button>';
    } else {
      var ok = S._s7.every(function (v, i) { return v === i; });
      html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (ok ? 'correct' : 'incorrect') + '">' +
        (ok ? t(C.ui.perfect) : t(C.ui.correctOrderGreen)) + '</div>';
    }

    el.innerHTML = html;

    if (!checked) {
      var dragIdx = null;
      $$('.ob-sequence__item', el).forEach(function (item, i) {
        item.addEventListener('dragstart', function (e) { dragIdx = i; e.dataTransfer.effectAllowed = 'move'; this.classList.add('ob-sequence__item--dragging'); });
        item.addEventListener('dragend', function () { this.classList.remove('ob-sequence__item--dragging'); dragIdx = null; });
        item.addEventListener('dragover', function (e) { e.preventDefault(); });
        item.addEventListener('drop', function (e) {
          e.preventDefault();
          if (dragIdx !== null && dragIdx !== i) { var tmp = S._s7[dragIdx]; S._s7[dragIdx] = S._s7[i]; S._s7[i] = tmp; saveState(); r7(); }
        });
        // Tap / keyboard swap
        onActivate(item, function () {
          if (S._s7tap == null) { S._s7tap = i; this.style.outline = '2px solid var(--color-primary)'; }
          else {
            if (S._s7tap !== i) { var tmp = S._s7[S._s7tap]; S._s7[S._s7tap] = S._s7[i]; S._s7[i] = tmp; }
            S._s7tap = null;
            _refocus = '#seq7 .ob-sequence__item:nth-child(' + (i + 1) + ')';
            saveState();
            r7();
          }
        });
      });
      var chk = $('#chk7');
      if (chk) chk.addEventListener('click', function () {
        S._s7checked = true; S.done[7] = true;
        var ok7 = S._s7.every(function (v, i) { return v === i; });
        announce(fbPrefix(ok7) + t(ok7 ? C.ui.perfect : C.ui.correctOrderGreen));
        _refocus = function () { return document.getElementById('nextBtn'); };
        saveState();
        updateNav();
        r7();
      });
    }

    applyRefocus(el);
  }

  /* ── Step 8: Multiple choice ── */
  function r8() {
    var d = C.s8;
    writeRead(8, d.label, d.title, nl2p(t(d.read)));

    if (!S._s8) S._s8 = {};
    var el = $('#practice-8');
    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>';

    d.quiz.forEach(function (q, qi) {
      var answered = S._s8[qi] !== undefined;
      html += '<div style="margin-bottom:1.5rem"><p class="ob-quiz-prompt">' + t(q.prompt) + '</p><div class="ob-options">';
      q.options.forEach(function (o, oi) {
        var cls = 'ob-option';
        if (answered) { if (o.correct) cls += ' ob-option--correct'; else if (S._s8[qi] === oi) cls += ' ob-option--incorrect'; }
        html += '<button class="' + cls + '" data-qi="' + qi + '" data-oi="' + oi + '"><span class="ob-option__indicator"></span><span>' + t(o.text) + '</span></button>';
      });
      html += '</div>';
      if (answered) {
        html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (q.options[S._s8[qi]].correct ? 'correct' : 'incorrect') + '">' + t(q.feedback) + '</div>';
      }
      html += '</div>';
    });

    el.innerHTML = html;
    $$('.ob-option:not(.ob-option--correct):not(.ob-option--incorrect)', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qi8 = parseInt(this.getAttribute('data-qi'));
        var oi8 = parseInt(this.getAttribute('data-oi'));
        S._s8[qi8] = oi8;
        announce(fbPrefix(d.quiz[qi8].options[oi8].correct) + t(d.quiz[qi8].feedback));
        if (Object.keys(S._s8).length === d.quiz.length) { S.done[8] = true; updateNav(); }
        r8();
      });
    });
  }

  /* ── Step 9: Tone ── */
  function r9() {
    var d = C.s9;
    writeRead(9, d.label, d.title, nl2p(t(d.read)));

    if (!S._s9) S._s9 = {};
    var el = $('#practice-9');
    var yes = t(C.ui.soundsLikeICS);
    var no = t(C.ui.notSoundsLikeICS);

    var html = '<p class="ob-practice-label">' + t(d.practiceLabel) + '</p>' +
      '<p class="ob-quiz-prompt">' + t(d.quiz.prompt) + '</p>';

    d.quiz.samples.forEach(function (s, si) {
      var answered = S._s9[si] !== undefined;
      html += '<div class="ob-tone-item"><div class="ob-tone-quote">' + t(s.text) + '</div><div class="ob-tone-actions">';
      [true, false].forEach(function (val) {
        var cls = 'ob-tone-btn';
        if (answered) { if (val === s.isICS) cls += ' ob-tone-btn--correct'; else if (S._s9[si] === val) cls += ' ob-tone-btn--incorrect'; }
        html += '<button class="' + cls + '" data-si="' + si + '" data-v="' + val + '">' + (val ? yes : no) + '</button>';
      });
      html += '</div>';
      if (answered) {
        html += '<div class="ob-feedback ob-feedback--visible ob-feedback--' + (S._s9[si] === s.isICS ? 'correct' : 'incorrect') + '">' + t(s.feedback) + '</div>';
      }
      html += '</div>';
    });

    el.innerHTML = html;
    $$('.ob-tone-btn:not(.ob-tone-btn--correct):not(.ob-tone-btn--incorrect)', el).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var si9 = parseInt(this.getAttribute('data-si'));
        var val9 = this.getAttribute('data-v') === 'true';
        S._s9[si9] = val9;
        announce(fbPrefix(val9 === d.quiz.samples[si9].isICS) + t(d.quiz.samples[si9].feedback));
        if (Object.keys(S._s9).length === d.quiz.samples.length) { S.done[9] = true; updateNav(); }
        r9();
      });
    });
  }

  /* ── Step 10: Assessment ── */
  function rAssessment() {
    var el = $('#content-10');
    var d = C.assessment;

    if (S.aQ.length === 0) genAssessment();

    if (S.aScore >= 0) {
      var pass = S.aScore >= 8;
      el.innerHTML = '<div style="text-align:center">' +
        '<h2 class="ob-title">' + t(d.title) + '</h2>' +
        '<div class="ob-score"><div class="ob-score__circle ob-score__circle--' + (pass ? 'pass' : 'fail') + '">' +
        '<span class="ob-score__number">' + S.aScore + '</span><span class="ob-score__total">' + t(C.ui.of) + ' 10</span></div></div>' +
        '<p style="font-size:1.125rem;font-weight:600;color:' + (pass ? 'var(--color-success)' : 'var(--color-error)') + ';margin-bottom:0.5rem">' + t(pass ? d.pass : d.fail) + '</p>' +
        '<p class="ob-text ob-text--secondary">' + t(pass ? d.passMsg : d.failMsg) + '</p>' +
        (pass
          ? '<button class="ob-btn ob-btn--primary" id="toCert">' + t(C.nav.certificate) + '</button>'
          : '<button class="ob-btn ob-btn--accent" id="retryA">' + t(C.nav.retry) + '</button>') +
        '</div>';
      if (pass) $('#toCert').addEventListener('click', function () { goTo(11); });
      else $('#retryA').addEventListener('click', function () { S.aQ = []; S.aA = {}; S.aScore = -1; saveState(); rAssessment(); });
      return;
    }

    var html = '<h2 class="ob-title">' + t(d.title) + '</h2><p class="ob-text ob-text--secondary">' + t(d.text) + '</p>';
    S.aQ.forEach(function (qi, i) {
      var q = BANK[qi];
      html += '<div class="ob-assessment-q"><p class="ob-assessment-q__num">' + (i + 1) + '</p>' +
        '<p class="ob-quiz-prompt">' + t(q.q) + '</p><div class="ob-options">';
      q.o.forEach(function (o, oi) {
        var cls = 'ob-option'; if (S.aA[i] === oi) cls += ' ob-option--selected';
        html += '<button class="' + cls + '" data-qi="' + i + '" data-oi="' + oi + '"><span class="ob-option__indicator"></span><span>' + t(o.text) + '</span></button>';
      });
      html += '</div></div>';
    });
    html += '<button class="ob-btn ob-btn--primary" id="submitA" style="margin-top:1rem">' + t(C.nav.submit) + '</button>';
    el.innerHTML = html;

    $$('.ob-option', el).forEach(function (btn) {
      btn.addEventListener('click', function () { S.aA[parseInt(this.getAttribute('data-qi'))] = parseInt(this.getAttribute('data-oi')); saveState(); rAssessment(); });
    });
    $('#submitA').addEventListener('click', function () {
      var score = 0;
      S.aQ.forEach(function (qi, i) { if (S.aA[i] !== undefined && BANK[qi].o[S.aA[i]].c) score++; });
      S.aScore = score;
      if (score >= 8) S.done[10] = true;
      announce(t(score >= 8 ? d.pass : d.fail) + '. ' + score + ' ' + t(C.ui.of) + ' 10. ' + t(score >= 8 ? d.passMsg : d.failMsg));
      saveState();
      rAssessment();
    });
  }

  function genAssessment() {
    var byS = {};
    BANK.forEach(function (q, i) { if (!byS[q.s]) byS[q.s] = []; byS[q.s].push(i); });
    var sel = [];
    Object.keys(byS).forEach(function (s) { var p = shuffle(byS[s]); if (p.length) sel.push(p[0]); });
    var rest = []; BANK.forEach(function (_, i) { if (sel.indexOf(i) === -1) rest.push(i); });
    rest = shuffle(rest);
    while (sel.length < 10 && rest.length) sel.push(rest.shift());
    S.aQ = shuffle(sel).slice(0, 10);
    S.aA = {};
  }

  /* ── Step 11: Certificate ── */
  function rCertificate() {
    var el = $('#content-11');
    var d = C.certificate;
    var dateStr = new Date().toLocaleDateString(lang() === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    el.innerHTML =
      '<div class="ob-certificate">' +
        '<div class="ob-certificate__mark">ICS</div>' +
        '<p class="ob-certificate__title">' + t(d.subtitle) + '</p>' +
        '<p class="ob-certificate__name">' + esc(S.name) + '</p>' +
        '<p class="ob-certificate__body">' + t(d.body) + '</p>' +
        '<p class="ob-certificate__date">' + dateStr + '</p>' +
        '<button class="ob-btn ob-btn--accent" onclick="window.print()">' + t(C.nav.print) + '</button>' +
      '</div>';
    confetti();
  }

  function confetti() {
    if (reducedMotion()) return;
    var old = $('.ob-confetti'); if (old) old.remove();
    var wrap = document.createElement('div'); wrap.className = 'ob-confetti';
    var colors = ['#005868', '#FFDA8E', '#F5EBE2', '#2e7d32'];
    for (var i = 0; i < 50; i++) {
      var p = document.createElement('div'); p.className = 'ob-confetti__piece';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 2 + 's';
      p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = (5 + Math.random() * 7) + 'px';
      p.style.height = (5 + Math.random() * 7) + 'px';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(function () { wrap.remove(); }, 5000);
  }

  /* ═══════════════════════════════════════
     LANG TOGGLE
     ═══════════════════════════════════════ */
  function initLang() {
    $$('.ob-lang-toggle__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.documentElement.lang = this.getAttribute('data-lang-switch');
        $$('.ob-lang-toggle__btn').forEach(function (b) { b.classList.remove('ob-lang-toggle__btn--active'); });
        this.classList.add('ob-lang-toggle__btn--active');
        render(S.step);
        updateProgress();
        updateNav();
        saveState();
      });
    });
  }

  function syncLangButtons() {
    $$('.ob-lang-toggle__btn').forEach(function (b) {
      b.classList.toggle('ob-lang-toggle__btn--active', b.getAttribute('data-lang-switch') === lang());
    });
  }

  /* ═══════════════════════════════════════
     INIT
     ═══════════════════════════════════════ */
  function init() {
    S.total = RENDER_FNS.length - 1;

    // Rehydrate saved progress + language
    var saved = loadState();
    if (saved) {
      if (saved.lang === 'en' || saved.lang === 'es') document.documentElement.lang = saved.lang;
      if (saved.S) {
        Object.keys(saved.S).forEach(function (k) { S[k] = saved.S[k]; });
        S.total = RENDER_FNS.length - 1;
      }
    }
    syncLangButtons();

    initLang();
    $('#prevBtn').addEventListener('click', function () { goTo(S.step - 1); });
    $('#nextBtn').addEventListener('click', function () {
      if (S.step === 10) { var b = $('#submitA'); if (b) b.click(); return; }
      goTo(S.step + 1);
    });
    var reset = $('#resetBtn');
    if (reset) reset.addEventListener('click', function () {
      var msg = lang() === 'es' ? 'Empezar de nuevo? Se borrará tu progreso.' : 'Start over? Your progress will be erased.';
      if (window.confirm(msg)) { clearState(); location.reload(); }
    });

    goTo(S.step || 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
