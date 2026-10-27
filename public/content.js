/* ======================================================================
 *  Debate Academy – content bank (edit freely; no build step needed)
 *  Everything pupils read lives here: bricks, samples, drills, cases.
 * ====================================================================== */
window.CONTENT = (() => {
  // The order pupils are taught and drilled in. Matches the numbered list and the
  // sample argument in the brief (Point → Significance → Cause → Effect → Example).
  // To switch to "Point, Cause, Significance, Effect, Example", change this array only.
  const BRICK_ORDER = ['point', 'significance', 'cause', 'effect', 'example'];

  const BRICKS = {
    point: {
      label: 'Point', icon: '🎯', color: '#d9482b', on: '#ffffff',
      def: 'This is usually one sentence that summarises your claim. The title of your argument should be based on this. Make it clear and direct.',
      ask: 'What exactly am I claiming?',
      starters: ['The main problem with ___ is that…', 'Banning / allowing ___ would lead to…'],
      min: 6,
    },
    significance: {
      label: 'Significance', icon: '⭐', color: '#f2a900', on: '#1f2a44',
      def: 'Explains why this point is important and why people should actually care. For example, explaining why the benefits that your side brings people are essential for their daily life. You can also explain how your impacts are more serious than those happening on the other side.',
      ask: 'Why should anyone care?',
      starters: ['This matters because…', 'People should care because…', 'This is more serious than the other side’s harms because…'],
      min: 12,
    },
    cause: {
      label: 'Cause', icon: '🔧', color: '#238b7e', on: '#ffffff',
      def: 'This is based on a motion’s unique characteristics and specific context, which are more factual and objective. This will explain why your claim is true.',
      ask: 'Why is my claim true?',
      starters: ['This happens because…', 'Since ___, ___ will…', 'The reason is that…'],
      min: 15,
    },
    effect: {
      label: 'Effect', icon: '💥', color: '#3a6ea5', on: '#ffffff',
      def: 'The claim being used by the debater to support or refute the motion. Usually, the other side will disagree on the effect that occurs.',
      ask: 'What result follows, and how does it support my side?',
      starters: ['As a result,…', 'This leads to…', 'Because of this,…'],
      min: 12,
    },
    example: {
      label: 'Example', icon: '🌍', color: '#7b5ea7', on: '#ffffff',
      def: 'Convinces the audience that your point is true in real life. You can use specific events or statistics.',
      ask: 'Where has this happened in real life?',
      starters: ['For example, in ___ (year),…', 'A study by ___ found that…', 'In ___, …'],
      min: 12,
    },
  };

  const RANKS = [
    { xp: 0, name: 'Trainee Speaker' },
    { xp: 100, name: 'Junior Debater' },
    { xp: 250, name: 'Rising Advocate' },
    { xp: 450, name: 'Skilled Orator' },
    { xp: 700, name: 'Master Debater' },
    { xp: 1000, name: 'Chief Justice' },
  ];

  /* ---------------------------------------------------------------- *
   *  Motions pupils can pick in the Workshop (teachers can add more)
   * ---------------------------------------------------------------- */
  const MOTIONS = [
    { id: 'cull', text: 'This House would ban the culling of urban wildlife.', kind: 'policy', terms: ['ban', 'culling', 'urban wildlife'] },
    { id: 'fastfood', text: 'This House would ban fast food advertisements.', kind: 'policy', terms: ['ban', 'fast food', 'advertisements'] },
    { id: 'tuition', text: 'This House believes that tuition does more harm than good.', kind: 'opinion', terms: ['tuition', 'harm', 'good'] },
    { id: 'rewards', text: 'This House believes that parents should not use rewards to get their children to study.', kind: 'opinion', terms: ['rewards', 'study'] },
    { id: 'homework', text: 'This House would ban homework for primary school pupils.', kind: 'policy', terms: ['ban', 'homework', 'primary school'] },
    { id: 'social', text: 'This House believes that social media does more harm than good to teenagers.', kind: 'opinion', terms: ['social media', 'harm', 'teenagers'] },
    { id: 'zoos', text: 'This House believes that zoos should be closed.', kind: 'opinion', terms: ['zoos', 'closed'] },
    { id: 'uniform', text: 'This House believes that school uniforms should be abolished.', kind: 'opinion', terms: ['uniforms', 'abolished'] },
  ];

  /* ---------------------------------------------------------------- *
   *  Sample arguments (also the pool for the Label and Wall drills)
   * ---------------------------------------------------------------- */
  const SAMPLES = [
    {
      id: 'rewards',
      motion: 'THBT parents should not use rewards to get their children to study',
      side: 'Opposition',
      bricks: {
        point: 'Studying becomes a routine for children, allowing them to learn independently.',
        significance: 'Children keep studying even without the reward system as studying is now an activity done instinctively by them.',
        cause: 'The rewards are an incentive for the children to study. When they are incentivised to study, the children study more frequently. Hence, studying becomes a frequent and normal everyday activity for them.',
        effect: 'Children start to study without parents having to nag them about it. Since studying has become a routine for children, studying is then established as an important habit to children.',
        example: 'For example, in some kindergartens, a sticker chart is used. When a child does something that is encouraged, such as cleaning up their toys without reminders, a sticker is added beside their name. It is a consistent system and when it is used for a substantial period of time, the system is easily forgotten but the good habits remain.',
      },
    },
    {
      id: 'cull-prop',
      motion: 'This House would ban the culling of urban wildlife.',
      side: 'Proposition',
      bricks: {
        point: 'Cities should ban culling because non-lethal methods control urban wildlife more effectively.',
        significance: 'If a city keeps killing animals without solving the problem, the animals die for nothing and residents are left with the same worries. Choosing a method that actually works protects both people and animals, and saves public money that would otherwise be spent on culling again and again.',
        cause: 'Culling only removes the animals that are there today; it does not remove the reasons they came, such as easy food and safe places to nest. As long as food and shelter remain, new animals move in or the survivors breed to fill the gap. Non-lethal methods such as swapping eggs for dummy eggs, sterilisation and securing rubbish tackle the food and breeding that cause the problem, so numbers fall and stay down.',
        effect: 'With culling banned, cities are pushed to adopt long-term solutions. Wildlife numbers fall gradually without cycles of killing, so conflicts with residents decrease instead of returning year after year.',
        example: 'Basel in Switzerland reportedly culled pigeons for over twenty years without bringing numbers down. After it switched to pigeon lofts where real eggs are swapped for dummy ones, together with warnings against feeding, the population reportedly halved within about four years.',
      },
    },
    {
      id: 'cull-opp',
      motion: 'This House would ban the culling of urban wildlife.',
      side: 'Opposition',
      bricks: {
        point: 'Cities should keep the power to cull because it protects people when wildlife becomes dangerous.',
        significance: 'People’s safety comes first. An injury cannot be undone, and children and the elderly are the most at risk. A city that cannot act quickly puts its residents in danger, which is a more serious harm than the discomfort of culling.',
        cause: 'In cities, wild animals often have plenty of food and no natural predators, so their numbers can grow quickly and they lose their fear of humans. Alternatives such as sterilisation and relocation are slow and only reduce numbers over many years, so they cannot deal with a large population that is already causing danger. Culling is the only method that reduces numbers immediately.',
        effect: 'If culling is banned, authorities have no way to respond quickly when a population becomes unsafe, so residents stay exposed to injuries for longer. Keeping culling as an option lets cities remove the danger first and then use long-term methods.',
        example: 'Berlin, home to thousands of wild boar, has called on hunters to cull hundreds of them each year, after incidents such as one in 2012 when a boar injured four people outside an apartment building.',
      },
    },
    {
      id: 'tuition-prop',
      motion: 'THBT tuition does more harm than good',
      side: 'Proposition',
      bricks: {
        point: 'Tuition harms students by taking away their free time.',
        significance: 'Free time is important for children’s mental health and growth, so losing it affects their happiness and development for years to come.',
        cause: 'Tuition lessons are held after school and on weekends, so children spend their evenings and weekends studying instead of resting, playing or spending time with family.',
        effect: 'Children become tired and stressed, and they have less time for hobbies and friends, which makes them unhappier overall.',
        example: 'In Singapore, many pupils attend tuition after school, and some go several times a week, leaving them little time to play or rest.',
      },
    },
    {
      id: 'fastfood-prop',
      motion: 'This House would ban fast food advertisements',
      side: 'Proposition',
      bricks: {
        point: 'Banning fast food ads will reduce how much unhealthy food children eat.',
        significance: 'Healthy eating habits formed in childhood last into adulthood, so a healthier childhood means fewer illnesses and lower medical costs for families and the country.',
        cause: 'Fast food ads use cartoons, toys and bright colours aimed at children, so children ask their parents for fast food more often than they otherwise would.',
        effect: 'With fewer ads, children ask for fast food less, so families buy less of it and children eat fewer unhealthy meals.',
        example: 'Quebec in Canada has banned advertising aimed at children under 13 since 1980, and a study found that Quebec families spent less on fast food than similar families elsewhere in Canada.',
      },
    },
  ];

  /* ---------------------------------------------------------------- *
   *  Rebuttal Arena cases: each argument has ONE cracked brick
   * ---------------------------------------------------------------- */
  const SCENARIOS = [
    {
      id: 'ads-effect', title: 'The Perfect Ban',
      motion: 'This House would ban fast food advertisements.', side: 'Proposition', crack: 'effect', family: 'nottrue',
      bricks: {
        point: 'Banning fast food ads would make children in our country healthier.',
        significance: 'Healthy children grow into healthy adults, which means fewer illnesses and lower medical costs for the whole country.',
        cause: 'Children see many fast food ads on television and online, and these ads use cartoons and free toys, so children ask for fast food much more often.',
        effect: 'Once the ads are gone, every child will stop eating unhealthy food and become healthy straight away.',
        example: 'Quebec in Canada has banned advertising aimed at children under 13 since 1980, and a study found that Quebec families spent less on fast food than similar families elsewhere in Canada.',
      },
      why: 'The effect is exaggerated. Ads are only one reason children eat fast food (parents, friends, taste and price matter too), so a ban might reduce fast food eating but cannot make every child healthy at once. Always check whether a claim is too big to be believable.',
      model: {
        say: 'The Proposition claims that removing fast food ads will make every child healthy straight away.',
        but: 'Not true: that effect is far too big, because ads are only one of many reasons children eat fast food.',
        because: 'Children also eat what their parents buy, what their friends like and what is cheap and tasty, so removing ads would only reduce fast food a little, not stop it completely.',
        so: 'So the benefit is much smaller than the Proposition says, and it is not big enough to justify taking away businesses’ freedom to advertise.',
      },
    },
    {
      id: 'tuition-cause', title: 'The Price Tag',
      motion: 'This House believes that tuition does more harm than good.', side: 'Opposition', crack: 'cause', family: 'nottrue',
      bricks: {
        point: 'Tuition helps students to score better in their exams.',
        significance: 'Good results open doors to better schools and jobs, which matters a lot to students and their families.',
        cause: 'Tuition costs a lot of money, so the tutors must be excellent at teaching.',
        effect: 'Students learn difficult topics more deeply and score higher, so tuition does more good than harm.',
        example: 'Research on tutoring programmes in several countries has found that pupils who receive regular tutoring often make bigger gains than pupils who do not.',
      },
      why: 'The cause does not prove the claim. A high price does not mean good teaching, because fees also depend on rent, advertising and demand. A cause must explain why the claim is true, not just sound impressive.',
      model: {
        say: 'The Opposition says tuition helps because it is expensive, so the tutors must be excellent.',
        but: 'Not true: a high price does not prove high quality.',
        because: 'Fees depend on rent, advertising and demand, and some tuition centres only drill past-year papers without helping pupils understand, so the price tells us nothing about how well pupils learn.',
        so: 'So the Opposition has not shown that tuition improves understanding, and the harms of stress and cost that we raised still stand.',
      },
    },
    {
      id: 'cull-significance', title: 'The Tidy City',
      motion: 'This House would ban the culling of urban wildlife.', side: 'Opposition', crack: 'significance', family: 'eveniff',
      bricks: {
        point: 'Culling should be allowed because it keeps city streets neat and tidy.',
        significance: 'A tidy city looks nice, and looking nice is the most important thing for a city.',
        cause: 'Many urban animals, like pigeons and crows, leave droppings and tear open rubbish bags, so fewer animals means less mess.',
        effect: 'With fewer animals, streets and public squares stay cleaner, which makes the city a more pleasant place to live.',
        example: 'Squares where large flocks of pigeons gather are often covered in droppings that cleaners must wash away every day.',
      },
      why: 'The significance is weak. Neat streets are nice, but the impact is small compared with the lives of animals on the other side. Significance must show that people should really care, and that your impact is more serious than the other side’s.',
      model: {
        say: 'The Opposition says culling matters because it keeps the city looking tidy.',
        but: 'Even if a tidy city is nice, tidiness is not important enough to justify killing animals.',
        because: 'Mess can be cleaned up with better rubbish bins and regular cleaning, while a life that is taken can never be given back, so the harm on our side is far more serious.',
        so: 'So the Opposition’s benefit is minor compared with the harm of culling, and the motion should stand.',
      },
    },
    {
      id: 'social-example', title: 'My Cousin Says',
      motion: 'This House believes that social media does more harm than good to teenagers.', side: 'Proposition', crack: 'example', family: 'nottrue',
      bricks: {
        point: 'Social media harms teenagers because it steals their sleep.',
        significance: 'Sleep is essential for growing bodies and learning minds, so teenagers who sleep too little struggle with health, mood and schoolwork.',
        cause: 'Social media feeds never end and send alerts all night, so teenagers keep scrolling and chatting long after they should be asleep.',
        effect: 'Teenagers sleep fewer hours, feel tired in class and find it harder to concentrate, so the harm outweighs any fun they get from social media.',
        example: 'My cousin stays up on his phone until 2 a.m. every night and fails his tests.',
      },
      why: 'One person is not proof. A strong example is a well-known event, a study or statistics showing the point is true in many cases, not just one person’s story.',
      model: {
        say: 'The Proposition says social media steals sleep and uses their cousin as proof.',
        but: 'Not true that one cousin proves anything: one cousin cannot show what happens to teenagers in general.',
        because: 'We do not know whether his phone is the real reason he fails, and many teenagers use social media and still sleep well, so a single story cannot show the harm is widespread.',
        so: 'So the Proposition has not proven their point with evidence, and they need studies or statistics before the harm can outweigh the good.',
      },
    },
    {
      id: 'homework-point', title: 'Own Goal',
      motion: 'This House would ban homework for primary school pupils.', side: 'Opposition', crack: 'point', family: 'worsens',
      bricks: {
        point: 'Homework makes primary school children tired and stressed.',
        significance: 'Children who are tired and stressed cannot enjoy learning, and this affects their health and happiness.',
        cause: 'Children spend hours after school finishing worksheets, so they go to bed late and have no time to relax.',
        effect: 'Pupils feel exhausted, begin to dislike school and learn less in the long run.',
        example: 'Finland gives children relatively little homework, yet its pupils have done well in international tests such as PISA.',
      },
      why: 'This Opposition argument actually supports the Proposition! The Point must back your own side of the motion. If the other team could use your argument, something went wrong at the very start.',
      model: {
        say: 'The Opposition says homework makes children tired, stressed and less keen to learn.',
        but: 'Your side worsens the issue: by their own argument, homework makes children tired and stressed, so keeping it makes things worse, and that is exactly why we should ban it.',
        because: 'If homework causes exhaustion and a dislike of school, and countries with little homework still do well, then banning it would protect children without hurting their learning.',
        so: 'So the Opposition has helped prove our case, and the motion should pass.',
      },
    },
    {
      id: 'zoos-cause', title: 'Going in Circles',
      motion: 'This House believes that zoos should be closed.', side: 'Proposition', crack: 'cause', family: 'nottrue',
      bricks: {
        point: 'Zoos should be closed because they are cruel to animals.',
        significance: 'Animals can feel pain and boredom, so keeping them in unhappy conditions is a serious wrong that we should not accept.',
        cause: 'Zoos are cruel because keeping animals in cages is cruel.',
        effect: 'If zoos are closed, animals could live in sanctuaries or the wild, where they would suffer less.',
        example: 'A 2008 study in the journal Science found that African elephants in European zoos had a much shorter median lifespan than elephants living in Kenya’s Amboseli National Park.',
      },
      why: 'The cause just repeats the point in different words. It does not explain why zoos are cruel (for example, small spaces or no room to roam). A cause must give a reason, not repeat the claim.',
      model: {
        say: 'The Proposition says zoos are cruel because keeping animals in cages is cruel.',
        but: 'Not true that cages alone prove cruelty: that is the same claim said twice, not a reason.',
        because: 'They have not explained what is actually harmful about it; modern zoos can offer large habitats, vets and regular food, so we cannot tell whether the animals are truly suffering.',
        so: 'So the cause is unproven, and the Proposition cannot yet show that zoos should be closed.',
      },
    },
  ];

  // What each brick can crack like (used on slides and in feedback)
  const CRACKS = {
    point: 'Unclear, too many claims at once, or it actually helps the other side.',
    significance: 'Too small to matter, or it never says who is affected and how badly.',
    cause: 'The reasoning does not follow, or it only repeats the point.',
    effect: 'Exaggerated, or it does not actually support your side of the motion.',
    example: 'Just one person’s story, vague, or not really the same situation.',
  };

  const STAGE_EXAMPLE = {
    motion: 'This House would ban the culling of urban wildlife.',
    define: [
      ['ban', 'make it illegal, with penalties, for authorities and pest-control companies to do it.'],
      ['culling', 'the planned killing of selected animals to reduce a population. It does not include putting down a sick animal or stopping an animal that is attacking someone right now.'],
      ['urban wildlife', 'wild animals that nobody owns and that live in or around cities, such as wild boar, monkeys, crows and pigeons.'],
    ],
    context: 'Cities keep growing into places where animals live, and food waste draws animals in. Some governments respond by culling to keep numbers down. This debate asks whether that killing should be forbidden.',
  };

  /* ---------------------------------------------------------------- *
   *  Learn slides
   *    { title, html }      – plain slide (trusted static HTML)
   *    { title, sample }    – shows a sample argument (tap bricks to reveal)
   *    { title, bricks }    – interactive five-brick explainer
   *    { title, stage }     – defining the motion & setting context
   * ---------------------------------------------------------------- */
  const SLIDES = [
    {
      title: 'What is debate?',
      html: `<p class="big">In a debate, two or more teams <b>formally argue</b> over an agreed-upon issue, using <b>reason</b> to persuade others that their side is right.</p>
             <div class="callout">The issue is phrased as a <b>motion</b>. Think of it as the statement everyone is arguing about.</div>`,
    },
    {
      title: 'What is a motion?',
      html: `<p>A motion could be about <b>implementing new rules</b>…</p>
             <div class="motion-card policy"><span class="mk">Rule</span>This House would ban fast food advertisements.</div>
             <p>…or about an <b>opinion</b>.</p>
             <div class="motion-card opinion"><span class="mk">Opinion</span>This House believes that tuition does more harm than good.</div>
             <p class="small">“This House would” is often written <b>THW</b>. “This House believes that” is often written <b>THBT</b>.</p>`,
    },
    {
      title: 'Two sides: Proposition and Opposition',
      html: `<div class="two">
               <div class="side prop"><h3>Proposition</h3><p>Agrees with the motion.</p></div>
               <div class="side opp"><h3>Opposition</h3><p>Disagrees with the motion.</p></div>
             </div>
             <div class="callout">For the motion <i>“This House believes that tuition does more harm than good”</i>:
               <ul>
                 <li><b>Proposition</b> gives reasons why the disadvantages of tuition are more serious than the benefits of tuition.</li>
                 <li><b>Opposition</b> persuades the audience otherwise.</li>
               </ul></div>`,
    },
    { title: 'Before you argue: define the motion and set the context', stage: true },
    { title: 'Arguments are bricks', bricks: true },
    { title: 'Watch an argument being built', sample: 'rewards',
      note: 'Tap each brick to reveal it. Notice how every brick has a different job.' },
    { title: 'Sample: Proposition', sample: 'cull-prop',
      note: 'The Proposition says culling should be banned. Which brick tells you <i>why</i> the claim is true?' },
    { title: 'Sample: Opposition', sample: 'cull-opp',
      note: 'Same motion, opposite side. Notice the Opposition does not deny animals matter. It argues that people’s safety matters more.' },
    {
      title: 'Responding to a rebuttal',
      html: `<p>A <b>rebuttal</b> is when the other side attacks your argument. To respond (or to attack theirs), find the brick that is <b>cracked</b>, then use four moves:</p>
             <ol class="steps4">
               <li><b>SAY</b> – fairly summarise what they claimed.</li>
               <li><b>BUT</b> – name the crack. Begin with one of three starters: <b>Not true</b>, <b>Even if</b> or <b>Your side worsens the issue</b>. (Learn them in the <a href="#/toolkit">Rebuttal Toolkit</a>.)</li>
               <li><b>BECAUSE</b> – give your reason or evidence.</li>
               <li><b>SO</b> – link back: why does this help your side of the motion?</li>
             </ol>
             <p class="small">Where can a brick crack?</p>
             <ul class="cracks">__CRACKS__</ul>`,
    },
    {
      title: 'You are ready!',
      html: `<p class="big">You now know what debate is, how to set up a motion, and how to build and break arguments.</p>
             <div class="callout">Claim your XP, then head to the <b>Label the Brick</b> and <b>Build the Wall</b> drills, or jump straight into the <b>Workshop</b>.</div>`,
    },
  ];


  /* ---------------------------------------------------------------- *
   *  REBUTTALS: three sentence starters, covering five rebuttal types
   *    Not true                     = direct refutation + attacking the logic
   *    Even if                      = mitigation + weighing
   *    Your side worsens the issue  = the turn (link turn + impact turn)
   *  A reply is written as  starter + join + body.
   * ---------------------------------------------------------------- */
  const RB_FAMILIES = [
    {
      id: 'nottrue', starter: 'Not true', join: ': ', icon: '🚫', color: '#c0392b', on: '#ffffff',
      types: 'Direct refutation and attacking the logic',
      plain: 'Say their argument is false, or that their reasoning does not follow.',
      msg: 'What they are saying is factually incorrect. Or: their facts might be true, but their reasoning makes no sense.',
      strength: 'Good for clearing out weak, exaggerated or poorly researched arguments.',
      subs: [
        { id: 'denial', group: 'Attack the truth (direct refutation)', name: 'Denial (no link)',
          def: 'Argue that their action will not cause the outcome they claim.',
          claim: 'Banning homework will make pupils lazy.',
          body: 'banning homework only removes worksheets, so there is no link to laziness. Pupils still have lessons, reading and projects every day.' },
        { id: 'evidence', group: 'Attack the truth (direct refutation)', name: 'Counter-evidence',
          def: 'Use statistics, history or expert opinion to directly disprove what they say.',
          claim: 'Pupils who get little homework always do badly in tests.',
          body: 'Finland gives children relatively little homework, yet its pupils have done well in international tests such as PISA.' },
        { id: 'corr', group: 'Attack the logic', name: 'Correlation is not causation',
          def: 'Two things happening at the same time does not mean one caused the other.',
          claim: 'Teenagers who use social media a lot get lower marks, so social media ruins their marks.',
          body: 'two things happening together does not prove that one caused the other. Teenagers who already find school hard may spend more time online, so the low marks could come first.' },
        { id: 'slippery', group: 'Attack the logic', name: 'Slippery slope',
          def: 'Their predicted disaster needs a chain reaction of highly unlikely events.',
          claim: 'If parents give a sticker for studying, children will soon demand money for everything and stop learning altogether.',
          body: 'that needs a long chain of unlikely steps: stickers lead to demands for money, then to refusing every task, then to learning nothing. Each step is unlikely, so the whole disaster is very unlikely.' },
        { id: 'inconsistent', group: 'Attack the logic', name: 'Internal inconsistency',
          def: 'Two arguments made by the other side contradict each other.',
          claim: 'The Opposition first said, “Tuition is cheap, so every family can afford it.” Later they said, “Parents must save for years to pay for tuition.”',
          body: 'your own arguments contradict each other. You said tuition is cheap for every family, then said parents must save for years to afford it. Both cannot be true.' },
      ],
    },
    {
      id: 'eveniff', starter: 'Even if', join: ' ', icon: '⚖️', color: '#238b7e', on: '#ffffff',
      types: 'Mitigation and weighing',
      plain: 'Agree with them for a moment, then show it is small, or that your side matters more.',
      msg: 'It might happen, but it is a very small deal. Or: even if they are 100% right, our impacts are far more important.',
      strength: 'Mitigation is the safest way to shrink an argument you cannot completely disprove. Weighing is essential for winning close debates where both sides have harms.',
      subs: [
        { id: 'lowprob', group: 'Shrink it (mitigation)', name: 'Low probability',
          def: 'It might happen, but the chances are extremely small.',
          claim: 'If culling is banned, a wild boar might attack someone.',
          body: 'a boar could attack someone, such attacks are extremely rare, and most wild animals avoid people, so the risk is tiny.' },
        { id: 'lowsev', group: 'Shrink it (mitigation)', name: 'Low severity',
          def: 'It will happen, but the damage is minor or temporary.',
          claim: 'Without homework, pupils will feel lost at first.',
          body: 'pupils feel lost in the first week, the confusion is temporary, and they will settle into the new routine within a month.' },
        { id: 'timeframe', group: 'Outweigh it (weighing)', name: 'Timeframe',
          def: 'Your impact happens immediately, while theirs happens in the distant future.',
          claim: 'Sterilising animals would save the city money in the long run.',
          body: 'sterilising saves money in the long run, residents are at risk now, so our impact is immediate while theirs takes many years to appear.' },
        { id: 'magnitude', group: 'Outweigh it (weighing)', name: 'Magnitude',
          def: 'Your impact is much bigger: it affects far more people, or affects them far more seriously.',
          claim: 'Banning fast food ads will cost advertising companies some money.',
          body: 'advertising companies lose some money, our impact is much bigger: the health of millions of children matters far more than a few companies’ profits.' },
        { id: 'reversibility', group: 'Outweigh it (weighing)', name: 'Reversibility',
          def: 'Your side’s harms can be fixed later, but their side’s harms are permanent.',
          claim: 'Banning culling will leave the streets messy for a while.',
          body: 'the streets get messy, mess can be cleaned up later, but an animal that is killed can never be brought back.' },
      ],
    },
    {
      id: 'worsens', starter: 'Your side worsens the issue', join: ': ', icon: '🔄', color: '#7b5ea7', on: '#ffffff',
      types: 'The turn',
      plain: 'Steal their argument. Show that their side makes the very problem worse.',
      msg: 'Their own argument actually proves why my side wins.',
      strength: 'The most powerful rebuttal: instead of just cancelling their argument, you use it for your side and force them onto the defensive.',
      subs: [
        { id: 'linkturn', group: 'Turn it (the turn)', name: 'Link turn',
          def: 'Show that their action actually causes the opposite of what they want.',
          claim: 'Culling will reduce complaints about monkeys entering homes.',
          body: 'culling empties the area, new monkeys move in and the survivors breed faster, so complaints return and may even grow.' },
        { id: 'impactturn', group: 'Turn it (the turn)', name: 'Impact turn',
          def: 'Agree the outcome will happen, but argue it is actually good, or that their alternative is worse.',
          claim: 'If homework is banned, lessons will move more slowly.',
          body: 'slower lessons are the cure, not the problem. Rushing through topics is what leaves pupils confused and stressed, so your faster pace makes learning worse.' },
      ],
    },
  ];

  // Summary table (one row per rebuttal type)
  const RB_GLANCE = [
    { type: 'Direct refutation', family: 'nottrue', msg: 'What they are saying is factually incorrect.', strength: 'Good for clearing out weak or poorly researched arguments.' },
    { type: 'Attacking the logic', family: 'nottrue', msg: 'Their facts might be true, but their reasoning makes no sense.', strength: 'Highly effective against exaggerated “doom-and-gloom” arguments.' },
    { type: 'The turn', family: 'worsens', msg: 'Their own argument actually proves why my side wins.', strength: 'The most powerful: it forces the other side onto the defensive.' },
    { type: 'Mitigation', family: 'eveniff', msg: 'It might happen, but it is a very small deal.', strength: 'The safest way to shrink an argument you cannot completely disprove.' },
    { type: 'Weighing', family: 'eveniff', msg: 'Even if they are 100% right, our impacts are far more important.', strength: 'Essential for winning close debates with trade-offs on both sides.' },
  ];

  // Name That Rebuttal drill: the reply is shown without its starter
  const RB_ITEMS = [
    { family: 'nottrue', sub: 'denial', claim: 'Banning homework will make pupils lazy.', body: 'banning homework only removes worksheets, so there is no link to laziness. Pupils still have lessons, reading and projects every day.' },
    { family: 'nottrue', sub: 'evidence', claim: 'Pupils who get little homework always do badly in tests.', body: 'Finland gives children relatively little homework, yet its pupils have done well in international tests such as PISA.' },
    { family: 'nottrue', sub: 'corr', claim: 'Teenagers who use social media a lot get lower marks, so social media ruins their marks.', body: 'two things happening together does not prove that one caused the other. Teenagers who already find school hard may spend more time online, so the low marks could come first.' },
    { family: 'nottrue', sub: 'slippery', claim: 'If parents give a sticker for studying, children will soon demand money for everything and stop learning altogether.', body: 'that needs a long chain of unlikely steps: stickers lead to demands for money, then to refusing every task, then to learning nothing. Each step is unlikely, so the whole disaster is very unlikely.' },
    { family: 'nottrue', sub: 'inconsistent', claim: 'The Opposition first said, “Tuition is cheap, so every family can afford it.” Later they said, “Parents must save for years to pay for tuition.”', body: 'your own arguments contradict each other. You said tuition is cheap for every family, then said parents must save for years to afford it. Both cannot be true.' },
    { family: 'eveniff', sub: 'lowprob', claim: 'If culling is banned, a wild boar might attack someone.', body: 'a boar could attack someone, such attacks are extremely rare, and most wild animals avoid people, so the risk is tiny.' },
    { family: 'eveniff', sub: 'lowsev', claim: 'Without homework, pupils will feel lost at first.', body: 'pupils feel lost in the first week, the confusion is temporary, and they will settle into the new routine within a month.' },
    { family: 'eveniff', sub: 'timeframe', claim: 'Sterilising animals would save the city money in the long run.', body: 'sterilising saves money in the long run, residents are at risk now, so our impact is immediate while theirs takes many years to appear.' },
    { family: 'eveniff', sub: 'magnitude', claim: 'Banning fast food ads will cost advertising companies some money.', body: 'advertising companies lose some money, our impact is much bigger: the health of millions of children matters far more than a few companies’ profits.' },
    { family: 'eveniff', sub: 'reversibility', claim: 'Banning culling will leave the streets messy for a while.', body: 'the streets get messy, mess can be cleaned up later, but an animal that is killed can never be brought back.' },
    { family: 'worsens', sub: 'linkturn', claim: 'Culling will reduce complaints about monkeys entering homes.', body: 'culling empties the area, new monkeys move in and the survivors breed faster, so complaints return and may even grow.' },
    { family: 'worsens', sub: 'impactturn', claim: 'If homework is banned, lessons will move more slowly.', body: 'slower lessons are the cure, not the problem. Rushing through topics is what leaves pupils confused and stressed, so your faster pace makes learning worse.' },
    { family: 'nottrue', sub: 'denial', claim: 'Closing zoos means nobody will care about animals any more.', body: 'closing zoos will not stop people caring. Documentaries, sanctuaries and school trips to nature reserves still teach children about animals.' },
    { family: 'eveniff', sub: 'lowsev', claim: 'A ban on fast food ads means television channels will earn less.', body: 'television channels earn a little less, the loss is small and they can sell that time to other advertisers, so the damage is minor.' },
    { family: 'worsens', sub: 'linkturn', claim: 'Strict homework rules make pupils more responsible.', body: 'strict rules make pupils copy from friends to avoid punishment, so they learn to hide mistakes instead of taking responsibility.' },
    { family: 'nottrue', sub: 'corr', claim: 'Cities that stopped culling pigeons had more pigeons the next year, so stopping the cull caused more pigeons.', body: 'two events happening together does not prove one caused the other. The pigeons may have increased because more people fed them that year.' },
  ];

  // Rebuttal Lab: read an argument, choose a starter, write the reply (a model exists for each starter)
  const LAB_CASES = [
    { id: 'cull-safe', title: 'Safe Streets', motion: 'This House would ban the culling of urban wildlife.', side: 'Opposition',
      argument: { point: 'Culling keeps people safe from dangerous animals.', cause: 'Culling quickly cuts the number of animals that could attack people.', effect: 'Fewer attacks happen, so residents are safer.' },
      models: {
        nottrue: 'culling does not keep people safe for long, because when animals are removed, new animals move in and breed faster, so the danger soon returns.',
        eveniff: 'culling lowers the danger for a short time, the danger comes back, whereas securing rubbish and swapping eggs for dummy eggs keep numbers down for good.',
        worsens: 'culling empties the area, so hungry animals from nearby move in, and bold newcomers come closer to people looking for food.' } },
    { id: 'ads-business', title: 'Business as Usual', motion: 'This House would ban fast food advertisements.', side: 'Opposition',
      argument: { point: 'Banning fast food ads would harm businesses.', cause: 'Ads bring customers to restaurants, so without ads restaurants earn less.', effect: 'Some restaurants will close and workers will lose their jobs.' },
      models: {
        nottrue: 'restaurants will not close because of one ban, since they can still attract customers with tasty food, good prices and ads aimed at adults.',
        eveniff: 'some restaurants lose customers, children’s health matters far more than a restaurant’s sales, and illness lasts much longer than a drop in profits.',
        worsens: 'by keeping the ads, your side keeps pushing children towards unhealthy food, and the illnesses that follow cost families and the country more than the ban would cost restaurants.' } },
    { id: 'tuition-time', title: 'Free Time', motion: 'This House believes that tuition does more harm than good.', side: 'Proposition',
      argument: { point: 'Tuition takes away children’s free time.', cause: 'Lessons are held after school and on weekends.', effect: 'Children become tired and stressed.' },
      models: {
        nottrue: 'tuition does not have to steal free time, because many children attend one lesson a week and still have plenty of time to play and rest.',
        eveniff: 'tuition takes up some free time, it also builds results and confidence, which open doors to better schools and jobs for years to come.',
        worsens: 'children who struggle without help feel more stress in class, so removing support increases the pressure instead of reducing it.' } },
    { id: 'homework-tired', title: 'Tired Pupils', motion: 'This House would ban homework for primary school pupils.', side: 'Proposition',
      argument: { point: 'Homework makes primary school children tired and stressed.', cause: 'They spend hours after school finishing worksheets.', effect: 'They begin to dislike learning.' },
      models: {
        nottrue: 'homework does not need to take hours, because short, well-planned tasks of fifteen minutes build good habits without making children tired.',
        eveniff: 'homework makes children a little tired on some days, practising at home helps them remember and prepares them for secondary school for years to come.',
        worsens: 'with no practice at home, children forget what they learned and fall behind, and falling behind makes them more stressed before tests.' } },
    { id: 'zoo-space', title: 'Small Spaces', motion: 'This House believes that zoos should be closed.', side: 'Proposition',
      argument: { point: 'Zoos keep animals in small spaces.', cause: 'Animals cannot roam like they do in the wild.', effect: 'Animals suffer.' },
      models: {
        nottrue: 'not all zoos keep animals in small spaces, because many modern zoos build large habitats with room to climb, swim and hide.',
        eveniff: 'some animals have less room than in the wild, zoos protect endangered species through breeding programmes, and a species that goes extinct can never come back.',
        worsens: 'many zoo animals cannot survive in the wild, so closing zoos would leave them to die or be abandoned.' } },
    { id: 'social-friends', title: 'Staying Connected', motion: 'This House believes that social media does more harm than good to teenagers.', side: 'Opposition',
      argument: { point: 'Social media helps teenagers stay connected with friends.', cause: 'Chat apps let teenagers talk to friends at any time.', effect: 'Teenagers feel less lonely.' },
      models: {
        nottrue: 'social media does not make every teenager less lonely, because many feel left out when they see friends posting photos of events they were not invited to.',
        eveniff: 'social media helps some teenagers stay in touch, it also costs them sleep and attention, and tired teenagers struggle with their health and schoolwork.',
        worsens: 'constant online chatting replaces face-to-face time, so teenagers end up lonelier than before.' } },
  ];

  return { BRICK_ORDER, BRICKS, RANKS, MOTIONS, SAMPLES, SCENARIOS, CRACKS, STAGE_EXAMPLE, SLIDES, RB_FAMILIES, RB_GLANCE, RB_ITEMS, LAB_CASES };
})();
