export type Language = 'en' | 'es';

export interface ProgramSection {
  id: string;
  eyebrow: string;
  title: string;
  heading: string;
  paragraphs: string[];
  stat?: string;
  image: string;
  imageAlt: string;
  accent: string;
}

export interface Person {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}

export const wl4wj = {
  en: {
    nav: {
      programs: 'Programs',
      about: 'About Us',
      food: 'Food Program',
      chws: 'Community Health Workers',
      education: 'Education & Advocacy',
      gotv: 'Get Out the Vote',
      coalition: 'Coalition Building',
      story: 'Our Story',
      leadership: 'Leadership',
      board: 'Board Members',
      signIn: 'Sign In',
      platform: 'CHWOne Platform',
    },
    hero: {
      tagline: 'Together, We Are The Difference',
      sub: 'Women Leading for Wellness & Justice',
    },
    intro: [
      'At Women Leading for Wellness and Justice, we recognize the critical importance of women\u2019s leadership in driving positive change in marginalized communities. Women are often the backbone of their families and communities, and partnering with these leaders in addressing issues such as food insecurity, community health, and voter suppression is essential to creating lasting change. Through our programs and initiatives, WL4WJ collaborates with women who take an active role in shaping policies and practices that affect their lives and the lives of those around them. By supporting women who lead and equipping others to become agents of change, we are building a more robust and equitable society for all.',
      'We are committed to serving the underserved and achieving social justice for the marginalized. One way we serve is through the diligent efforts of our community health workers. With their help, WL4WJ provides wellness-related resources such as our Food and Nutrition Program. Part of our social justice efforts includes providing information to impacted communities via our Education program. At WL4WJ, we understand the importance of caring for the whole person, which is why we offer a variety of programs and services that are designed to promote holistic wellness for both communities and individuals. Our social justice outreach efforts center around our constituency about issues impacting their communities and holding elected officials accountable, mobilizing them to engage in political and societal activities. By coming together, aligning incentives, fundraising, and building capacity and capabilities, you and our coalition can makes a greater impact.',
      'We envision a society where individuals are valued and empowered to prioritize their physical, mental, and emotional well-being, and where justice is achieved through the dismantling of systems that perpetuate inequality and marginalization. We advocate for policies and programs that promote social justice and address the root causes of inequality. Being at the forefront of intersectional advocacy that promotes accountability and action-oriented execution can be taxing, but stress and fatigue are issues that are common to everyone. This is why WL4WJ espouses and exemplifies individual self-care and well-being, as they are essential components of a movement that can create a more just and equitable society.',
    ],
    vision: 'Together, we can create a future where social justice and individual wellness are inextricably linked!',
    stronger: {
      title: 'With you, we are stronger.',
      body: 'If you share our vision of social justice and wellness for all, we urge you to join us in our mission to create lasting change. Your support can take many forms. If you have time and expertise to share, consider volunteering with us. We are always looking for passionate people to help us with our community programs, voter education, mobilization efforts, and coalition building. If you have financial resources to contribute, consider donating to our organization. Your donation will go a long way in supporting our food program, community health worker program, and other initiatives that benefit marginalized communities. Finally, if you are part of an organization that shares our goals and values, we invite you to join our coalition. Together, we can build a stronger, more equitable society for all. Thank you for your support.',
      cta: 'Be the difference.',
      actions: [
        { label: 'Make a donation', href: '/login' },
        { label: 'Become a volunteer', href: '/login' },
        { label: 'Join the coalition', href: '/login' },
        { label: 'Ask a question', href: '/login' },
      ],
    },
    programsTitle: 'Our Programs',
    programsSub: 'Wellness and justice, side by side.',
    programs: [
      {
        id: 'food',
        eyebrow: 'Wellness',
        title: 'Food Program',
        heading: 'Hungry for Change',
        stat: 'North Carolina is the 9th hungriest state in the nation with 350 food deserts, where 1 in 8 people face hunger and 1 in 6 children face food insecurities. This is what we call an epidemic.',
        paragraphs: [
          'Food security is a critical issue facing many individuals and families in North Carolina, particularly those who are marginalized or living in poverty. The United States Department of Agriculture (USDA) defines food security as "access by all people at all times to enough food for an active, healthy life." By this definition, tens of thousands of North Carolinians are facing food insecurity as they struggle to access healthy, nutritious food on a regular basis. This is especially true for marginalized groups, low-income communities, and those living in food deserts.',
          'Our Food and Nutrition program has been instrumental in increasing access to healthy food and addressing the problem of food insecurity for underserved North Carolinians. Through partnerships with local farmers and community organizations, we have been able to provide access to healthy, fresh produce and other nutritious food options to those in need. Families who were previously struggling to put food on the table now have access to nutritious, high-quality food options, which can positively impact their physical, emotional, and mental well-being. Additionally, by supporting local farmers, especially Black, Brown, and women farmers, we are helping to strengthen the local economy and build sustainable food systems that benefit everyone.',
          'Our program provides not only food resources but also education to help individuals and families make healthy, sustainable food choices. This includes cooking classes, nutrition workshops, and information on local food resources. By focusing on education and access, we are building long-term solutions to food insecurity and promoting health and wellness within the communities we serve.',
          'We urge you to join us in our mission to address food insecurity and promote access to healthy food options for underserved communities. Your support can make a significant difference in the lives of people struggling to put food on the table and access nutritious options. Consider donating to our food program or volunteering your time to help with food distribution, cooking classes, or nutrition workshops. You can also support us by choosing to shop at local farmers\u2019 markets and grocery stores and co-ops that prioritize sustainable, ethical food production and distribution. Together, we can build a healthier, more just food system that benefits everyone.',
        ],
        image: '/wl4wj/programs/food/produce.jpg',
        imageAlt: 'Fresh produce from the WL4WJ Food and Nutrition Program',
        accent: '#34C759',
      },
      {
        id: 'chws',
        eyebrow: 'Wellness',
        title: 'Community Health Workers',
        heading: 'Connecting',
        stat: 'Relationships built on trust and respect.',
        paragraphs: [
          'Community Health Workers (CHWs) are frontline public health workers with an intimate understanding of and connection to the communities they serve. The relationships our CHWs have built are based on trust and respect; this allows them to be effective advocates and support systems for individuals and families in communities. CHWs connect North Carolinians to medical and social support resources, including vaccinations, health information, food, affordable housing, and transportation. At WL4WJ, our CHWs are committed to ensuring our communities have equal access to these resources and others that help individuals and families thrive. To connect people to much-needed resources, our CHW team collaborates with various grassroots groups and organizations to continually build out our referral resources.',
          'Through their work and expertise, our CHWs have improved health outcomes and reduced health disparities in the communities they serve. By providing education on preventative health measures, our CHWs have helped individuals manage chronic conditions and prevent the onset of new health issues. Our CHWs have also worked to increase access to healthcare services by connecting individuals to medical providers and other resources. Additionally, our CHWs position individuals to advocate for their health by empowering them to take an active role in their healthcare and to support policies that improve the health and well-being of their communities.',
          'We invite you to join us in supporting the efforts of our Community Health Workers and the impact they are making in underserved communities. Your support can help us to expand our reach and provide more education, outreach, and support to those who need it most. Together, we can reduce health disparities and promote health equity for all individuals, regardless of their background or socioeconomic status. We can create a healthier, more equitable future for all. Please consider donating or volunteering with WL4WJ to help us achieve our mission and make a meaningful difference in the lives of those we serve.',
        ],
        image: '/wl4wj/programs/chw/chw.png',
        imageAlt: 'WL4WJ Community Health Workers',
        accent: '#0071E3',
      },
      {
        id: 'education',
        eyebrow: 'Justice',
        title: 'Education & Advocacy',
        heading: 'Perspective',
        stat: 'Promoting transparency and fairness in government.',
        paragraphs: [
          'A healthy democracy requires active participation from its citizens to ensure that the elected officials and government representatives remain accountable and transparent. Holding officials responsible for their actions and inactions is essential to prevent abuses of power and to ensure that legislation represents the interests of the public. Unfortunately, it is not uncommon for those in power to prioritize personal interests over those of the communities they serve. Therefore, people must monitor and scrutinize the actions of elected officials and appointed officials in between elections. This is where we take the lead.',
          'Women Leading is committed to staying current on issues impacting the communities we serve, which is evidenced by our thorough tracking of legislative and judiciary activities at the local, state, and national levels. We closely monitor the actions of elected and appointed officials, particularly those that may impact underserved and marginalized communities. We do this so we can be responsible with our analysis of the information we gather and provide context and perspective to people so they can make informed political decisions. By providing comprehensive and easily digestible information on complex issues via our media on several social platforms, WL4WJ raises awareness and mobilizes community members around important causes. Through informing the people we serve, we inspire them to take action and turn the wheels of change which will lead to a better future for all.',
          'It is imperative for people to stay informed and engaged in the political process beyond just casting their votes. By observing and holding those in power accountable, we can help ensure that our communities are represented and protected. We do this by gathering, contextualizing, and disseminating unbiased, accurate, and timely information that allows people to make well-informed decisions. We invite you to join us in our efforts to stay informed and engaged in the political process. To support our work in distilling information, providing context and perspective, and equipping people with the knowledge to hold their officials accountable, follow the links below. With your support, we can continue to conduct research and produce media that empowers our community to take action and create positive change.',
        ],
        image: '/wl4wj/programs/education/cameras.jpg',
        imageAlt: 'Media and advocacy work at WL4WJ',
        accent: '#FF9500',
      },
      {
        id: 'gotv',
        eyebrow: 'Justice',
        title: 'Get Out the Vote',
        heading: 'Every Voice',
        stat: 'Stand up. Stand together. Strengthen our democracy for generations to come.',
        paragraphs: [
          'In recent years, there have been significant increases in efforts to limit electoral participation by people from marginalized communities. Restrictive Voter ID laws, the purging of voter rolls, the reduction of early voting days and polling places, gerrymandering, and misinformation disproportionately affect communities of color, low-income individuals, and other marginalized groups who already face systemic barriers to accessing the ballot box. Despite the obstacles marginalized communities face, they must exercise their right to vote and participate in the electoral process. Through collective action and perseverance, these communities can stand against suppression efforts and ensure their voices are heard.',
          'Women Leading recognizes the importance of civic engagement. One of the unique features of Women Leading\u2019s GOTV campaign is our emphasis on not just the presidential elections but also on local and state elections. We acknowledge that legislation passed by local and state officials significantly impacts people\u2019s daily lives, from school board decisions to housing policies to law enforcement practices. As such, Women Leading provides resources and support for individuals to learn about and engage with local and state officials and to hold them accountable for their actions. By empowering individuals to be active participants in the democratic process, Women Leading is helping to ensure the voices of marginalized communities are heard and that their needs are being addressed.',
          'Again, the importance of civic engagement and participation in our democracy cannot be overstated. That\u2019s why we urge you to support the critical work of WL4WJ in educating and mobilizing voters from underserved and marginalized communities. By joining our efforts, you can help ensure everyone can access the information, resources, and support they need to exercise their right to vote. Whether you volunteer your time, donate, or simply spread the word about our voter education and GOTV initiatives, your contribution can make a real difference. Together, we can help build a more equitable and just society where every voice is heard and vote counts.',
        ],
        image: '/wl4wj/programs/gotv/voter.jpg',
        imageAlt: 'A voter participating in the democratic process',
        accent: '#AF52DE',
      },
      {
        id: 'coalition',
        eyebrow: 'Justice',
        title: 'Coalition Building',
        heading: 'Unify',
        paragraphs: [
          'Women Leading has made significant strides in building a coalition of like-minded groups to increase our collective strength. This coalition can reach a broader audience and overcome complex challenges affecting underserved and marginalized communities that would have been far more challenging to tackle alone. When like-minded grassroots groups with similar goals and values come together, their collective strength can be greater than the sum of their parts. By leveraging these collective strengths, resources, skills, and expertise, our coalition has allowed for increased capacity and outreach as we learn, share, and develop a more diverse and inclusive movement.',
          'If you are a like-minded organization working towards similar goals, we urge you to join our coalition and strengthen our collective impact by following the links below. Together, we can create a more equitable and just society by pooling our resources, skillsets, and connections to drive meaningful change. Additionally, we encourage you to consider supporting WL4WJ directly through funding, volunteering, or other means. By doing so, you will be helping us to continue to grow our network and the positive impact we can have on people in need.',
        ],
        image: '/wl4wj/programs/coalition/group.jpg',
        imageAlt: 'WL4WJ coalition partners gathered together',
        accent: '#FF3B30',
      },
    ] as ProgramSection[],
    about: {
      eyebrow: 'About Us',
      title: 'Our Story',
      heading: 'Striving',
      paragraphs: [
        'Our founders, Ana Ilarraza-Blackburn and Kim Porter, met when appointed as the Latino Immigrant Liason and the Environmental & Climate Justice Chair for the North Carolina NAACP, respectively. Over several years, they developed a working relationship centered on support, encouragement, and a passion for social justice that continued beyond their time as appointed officials in the NC NAACP. In their work with other organizations in the social justice arena, they both began to notice a pattern of women being relegated to the background in decision-making processes despite their competence. While valued and utilized for their influence and skillsets, many of these women went without recognition for these attributes and their achievements. Our founders sought to solve this problem through the founding of Women Leading.',
        'With the establishment of Women Leading, our founders have created a space where women leaders are encouraged, supported, and recognized for the diligent work they have done and continue to do. Much of that work happens within our wellness and justice programs, where we serve others in need by providing resource access, healthy food, advocacy, and voting resources. Through the dedication of staff, volunteers, and supporters, we demand change for the poorest and most disenfranchised in our state and beyond.',
      ],
      missionTitle: 'Mission Statement',
      mission: 'Women Leading 4 Wellness and Justice seeks to provide underserved communities with more equitable access to information, materials, and support systems regarding healthcare, food security, and holistic wellness through clinics, seminars, and advocacy.',
      visionTitle: 'Vision',
      vision: 'Women\u2019s talents and leadership abilities have been essential in several successful social movements, and they will continue to be so in the future. However, these leaders need to be nurtured and supported to realize the fullness of their potential. This is why Women Leading was founded, not only to recognize and celebrate woman leaders of the past and present but to equip new leaders for the future. Through service opportunities, education, and advocacy, we aid people in need, support individuals doing the work, and empower others who, in turn, empower their communities, causing a domino effect of mobilization and positive societal change.',
      valuesTitle: 'Core 4 Values',
      valuesIntro: 'Social justice work has the potential to be very taxing in and of itself. We combat this reality by holding firmly to these 4 Values:',
      values: [
        {
          title: 'Comprehensive Listening',
          body: 'We listen to the ideas and concerns of everyone lending themselves to this work. This includes staff, volunteers, partner organizations, and the people we advocate for. Without listening, there is no comprehension. Without comprehension, there is no proper execution. Without proper execution, there is no progress.',
        },
        {
          title: 'Honoring The Hands That Work',
          body: 'We understand that many great social movements of the past and present have been successful due to the ideas, implementation, and leadership of people who weren\u2019t properly recognized. At Women Leading, we seek to change that element of social justice culture by honoring the hands that work and recognizing volunteers, staff, and partner organizations for what they are contributing to the mission.',
        },
        {
          title: 'Coalition Building',
          body: 'We strive to support individuals, organizations, and work that aligns with our mission and vision. The power to implement lasting change is gained collectively, so we bear the weight of our mission with the support of others.',
        },
        {
          title: 'Internal Wellness',
          body: 'We believe in promoting a holistic sense of wellness, including physical, mental, and emotional well-being. However, before expecting to see this in the larger society, we make it a practice to model this within Women Leading. We encourage all staff and volunteers to take the time to \u201crefill their cup\u201d so that they can be well and bring the best version of themselves to the table. We refuse to create one disparity to remedy another.',
        },
      ],
      valuesCoda: 'We listen, We Understand, We Strive, We Believe, We Are WL4WJ.',
    },
    leadershipTitle: 'Leadership',
    staff: [
      {
        name: 'Kim Porter',
        role: 'Co-Executive Director',
        image: '/wl4wj/about/staff/kim-porter.jpg',
        bio: 'Kim Porter is a native North Carolinian from the city of Winston-Salem. She has a plethora of experience from a 30-year career in social service, social justice, and advocacy. Earlier in her career, Kim connected families to much-needed social resources as a program manager and social worker for Appalachian State University. Following this, she would become the Executive Director of Triad Counseling Services, where she served people with mental health struggles in the Greensboro and High Point areas. After this engagement, her work would transition into social justice and advocacy. In 2014, while working as a community organizer with Democracy NC and NC Warn, Kim was appointed the Environmental & Climate Justice Chair for the North Carolina NAACP. Kim currently serves on the coordinating committee of the NC Poor People\u2019s Campaign and on the board of directors of both Community Roots and Renew Forsyth.',
      },
      {
        name: 'Ana Blackburn',
        role: 'Co-Executive Director',
        image: '/wl4wj/about/staff/ana-blackburn.jpg',
        bio: 'Ana Ilarraza-Blackburn was born in Brooklyn, NY, and raised in Chicago. She is the founder and president of Response Management Training and has utilized her 15 years of experience as a first responder to train others in emergency medicine for over 20 years. Ana is also the first Latino Immigrant Liaison for the North Carolina NAACP and one of the original NC Tri-Chairs for the Poor People\u2019s Campaign: A National Call For Moral Revival. During the COVID-19 pandemic, Ana served Black, Brown, and Immigrant communities when she spearheaded the Community Health Worker (CHW) program in the Sandhills of North Carolina. The CHWs supplied vaccination and healthcare access to the Black, Brown, and Immigrant communities in the Sandhills. Within six months, the CHW team brought access to over 10,000 people.',
      },
      {
        name: 'Trey Irby',
        role: 'Communications Director',
        image: '/wl4wj/about/staff/trey-irby.jpg',
        bio: 'Trey Irby is a native of Asheville, North Carolina, and a North Carolina Agricultural and Technical State University graduate. There, he obtained a public relations degree with a minor in political science. He has experience in marketing and communications work for non and for-profit organizations. His passion for social justice comes from a desire to see all people have access to bare necessities. He believes \u201cExtraordinary effort shouldn\u2019t be required to live an ordinary life.\u201d',
      },
      { name: 'Debra Lee', role: 'Certified CHW', image: '/wl4wj/about/staff/debra-lee.jpg' },
      { name: 'Carla M. Judd', role: 'Certified CHW', image: '/wl4wj/about/staff/carla-judd.jpg' },
      { name: 'Zachary Krenzler', role: 'Certified CHW', image: '/wl4wj/about/staff/zach-krenzler.jpg' },
      { name: 'Minerva Cisneros Garcia', role: 'Certified CHW', image: '/wl4wj/about/staff/minerva-garcia.jpg' },
      { name: 'Brian Stitt', role: 'Certified CHW', image: '/wl4wj/about/staff/brian-stitt.jpg' },
      { name: 'Karina Lane-Mu\u00f1oz Olmedo', role: 'Certified CHW', image: '/wl4wj/about/staff/karina-lane.jpg' },
    ] as Person[],
    boardTitle: 'Board of Directors',
    board: [
      {
        name: 'Geeta Kapur',
        role: 'Civil Rights & Criminal Defense Lawyer',
        image: '/wl4wj/about/board/geeta-kapur.jpg',
        bio: 'Geeta N. Kapur is a native of Kenya and currently lives in Durham, North Carolina. She is a seasoned civil rights and criminal defense lawyer who has devoted her career to defending poor and oppressed racial minorities and has argued landmark constitutional cases before the North Carolina Supreme Court and Court of Appeals. For her work, she has been recognized by the National Trial Lawyers Association as one of the top 100 criminal defense lawyers in North Carolina. Furthermore, Geeta was the lead pro bono lawyer for North Carolina\u2019s NAACP Moral Monday protests. Subsequently, she received the North Carolina NAACP\u2019s prestigious Humanitarian of the Year Award for her service.',
      },
      {
        name: 'Olinda Watkins-McSurely',
        role: 'Education Administrator',
        image: '/wl4wj/about/board/olinda-watkins.jpg',
        bio: 'O\u2019Linda Watkins-McSurely is a native of Moore County who has lived in Carthage all her life. She worked for the Department of Public Education\u2019s Office of Public Charter Schools and aided in the establishment of charter schools across North Carolina as an administrative assistant. O\u2019Linda ha served on many boards in Moore County and has been an active member of the NAACP for 36 years, even serving as President of Moore County NAACP for 26 years. She is a recipient of the Order of Long Leaf Pine and the Susan B. Anthony Award given by the NC-ERA Alliance.',
      },
      {
        name: 'Eliazar Posada',
        role: 'Legislator & Entrepreneur',
        image: '/wl4wj/about/board/eliazar-posada.jpg',
        bio: 'In 2016, Eliazar Posada relocated to Carrboro, NC, and on May 17, 2022, he became the first openly LGBTQ Latino elected in North Carolina after winning a special election. He serves as the Organizing Director of Equality NC and is also the founder of Posada Strategy Consulting. This firm works with nonprofit and grassroots organizations to build capacity, develop programs, and create strategies around fundraising, community outreach, and advocacy. Eliazar has also received the 2021 Frida Kahlo Lifetime Achievement Award and the 2021 Latino Diamante Latino Advocate Award for service to his community.',
      },
      {
        name: 'Elena J. Ceberio',
        role: 'Strategic Planning Specialist',
        image: '/wl4wj/about/board/elena-ceberio.jpg',
        bio: 'Elena J. Ceberio is a proud first-generation Basque American whose passion for social justice stems from her understanding of the ramifications of generational oppression. Before her organizing work, Elena held the position of director of materials planning for a large retailer. In this role, she was responsible for long-term planning, process management, and launching a $1.7 billion division of the retail group. Her organizing work encompasses being part of a team that distributed more than 38 tons of food during the COVID-19 pandemic. They also held back-to-school events that provided more than 1200 backpacks filled with school supplies, serving the needs of 2,265 families! Additionally, Elena has served in leadership roles in nationally recognized social justice organizations and is an active member of her church.',
      },
      {
        name: 'Steve Blackburn',
        role: 'Emergency Services Administrator',
        bio: 'Steve Blackburn a native North Carolinian with extensive project management experience and a passion for civic engagement. He has managed over 200 employees and was fiscally responsible for managing over 200 million dollars in assets. After 31 years as the Fort Bragg and Pope Army Air Field Fire Chief and 25 yrs. as the Deputy Fire Chief for Bonnie Doone Fire District in Cumberland County, Steve retired. He would go on to become a member of the Harnett County Board of Elections for four years to create systemic change for the moral and constitutional betterment of the county.',
      },
      {
        name: 'Paola Rodriguez',
        role: 'Board Member',
        image: '/wl4wj/about/board/paola-rodriguez.jpg',
      },
    ] as Person[],
    footer: {
      tagline: 'Women Leading for Wellness & Justice',
      platform: 'Powered by CHWOne',
      signIn: 'Sign In',
      chwone: 'CHWOne Platform',
      rights: 'All rights reserved.',
    },
  },
  es: {
    nav: {
      programs: 'Programas',
      about: 'Organizaci\u00f3n',
      food: 'Programa Alimentario',
      chws: 'Agentes de Salud Comunitarios',
      education: 'Educaci\u00f3n y Defensa',
      gotv: 'Salir a Votar',
      coalition: 'Formaci\u00f3n de Coaliciones',
      story: 'Historia',
      leadership: 'Directivos',
      board: 'Consejo de Administraci\u00f3n',
      signIn: 'Iniciar Sesi\u00f3n',
      platform: 'Plataforma CHWOne',
    },
    hero: {
      tagline: 'Juntos, somos la diferencia',
      sub: 'Mujeres Liderando por el Bienestar y la Justicia',
    },
    intro: [
      'En Mujeres Liderando por el Bienestar y la Justicia reconocemos la importancia decisiva del liderazgo femenino para impulsar cambios positivos en las comunidades marginadas. Las mujeres son a menudo la columna vertebral de sus familias y comunidades, y asociarse con estas l\u00edderes para abordar cuestiones como la inseguridad alimentaria, la salud de la comunidad y la supresi\u00f3n de votantes es esencial para crear un cambio duradero. A trav\u00e9s de nuestros programas e iniciativas, MLPBJ colabora con mujeres que asumen un papel activo en la configuraci\u00f3n de pol\u00edticas y pr\u00e1cticas que afectan a sus vidas y a las de quienes las rodean. Apoyando a las mujeres que lideran y equipando a otras para que se conviertan en agentes del cambio, estamos construyendo una sociedad m\u00e1s s\u00f3lida y equitativa para todos.',
      'Estamos comprometidos a servir a los desatendidos y lograr la justicia social para los marginados. Una forma en que servimos es a trav\u00e9s de los esfuerzos diligentes de nuestros Agentes de Salud Comunitarios. Con su ayuda, MLPBJ proporciona recursos relacionados con el bienestar, como nuestro programa de Alimentaci\u00f3n y Nutrici\u00f3n. Parte de nuestros esfuerzos por la justicia social incluye proporcionar informaci\u00f3n a las comunidades afectadas a trav\u00e9s de nuestro programa de Educaci\u00f3n. En MLPBJ entendemos la importancia de cuidar de las personas en su totalidad, y por eso ofrecemos una variedad de programas y servicios que est\u00e1n dise\u00f1ados para promover el bienestar hol\u00edstico tanto de las comunidades como de los individuos.',
      'Imaginamos una sociedad en la que se valore a las personas y se les capacite para dar prioridad a su bienestar f\u00edsico, mental y emocional, y en la que se logre la justicia mediante el desmantelamiento de los sistemas que perpet\u00faan la desigualdad y la marginaci\u00f3n. Abogamos por pol\u00edticas y programas que promuevan la justicia social y aborden las causas profundas de la desigualdad. Estar a la vanguardia de la defensa interseccional que promueve la rendici\u00f3n de cuentas y la ejecuci\u00f3n orientada a la acci\u00f3n puede ser agotador, pero el estr\u00e9s y la fatiga son problemas comunes a todos. Por ello, MLPBJ apoya y ejemplifica el autocuidado y el bienestar individuales, ya que son componentes esenciales de un movimiento que puede crear una sociedad m\u00e1s justa y equitativa.',
    ],
    vision: 'Juntos podemos crear un futuro en el que la justicia social y el bienestar individual est\u00e9n inextricablemente unidos!',
    stronger: {
      title: 'Contigo, somos m\u00e1s fuertes.',
      body: 'Si compartes nuestra visi\u00f3n de justicia social y bienestar para todos, te instamos a que te unas a nosotros en nuestra misi\u00f3n de crear un cambio duradero. Su apoyo puede adoptar muchas formas. Si tienes tiempo y experiencia que compartir, considera la posibilidad de trabajar como voluntario con nosotros. Siempre estamos buscando personas apasionadas que nos ayuden con nuestros programas comunitarios, la educaci\u00f3n de los votantes, los esfuerzos de movilizaci\u00f3n y la creaci\u00f3n de alianzas. Si dispone de recursos econ\u00f3micos para contribuir, considere la posibilidad de hacer un donativo a nuestra organizaci\u00f3n. Su donaci\u00f3n ser\u00e1 de gran ayuda para apoyar nuestro programa de alimentos, el programa de agentes de salud comunitarios y otras iniciativas que benefician a las comunidades marginadas. Por \u00faltimo, si formas parte de una organizaci\u00f3n que comparte nuestros objetivos y valores, te invitamos a unirte a nuestra coalici\u00f3n. Juntos podemos construir una sociedad m\u00e1s fuerte y equitativa para todos. Gracias por su apoyo.',
      cta: 'Marca la diferencia.',
      actions: [
        { label: 'Hacer un donativo', href: '/login' },
        { label: 'Ser voluntario', href: '/login' },
        { label: 'Unirse a la coalici\u00f3n', href: '/login' },
        { label: 'Hacer una pregunta', href: '/login' },
      ],
    },
    programsTitle: 'Nuestros Programas',
    programsSub: 'Bienestar y justicia, lado a lado.',
    programs: [
      {
        id: 'food',
        eyebrow: 'Bienestar',
        title: 'Programa Alimentario',
        heading: 'Hambre de Cambios',
        stat: 'Carolina del Norte es el noveno estado m\u00e1s hambriento del pa\u00eds, con 350 desiertos alimentarios, donde 1 de cada 8 personas pasa hambre y 1 de cada 6 ni\u00f1os sufre precariedad alimentaria, esto es lo que llamamos una epidemia.',
        paragraphs: [
          'La seguridad alimentaria es un problema cr\u00edtico al que se enfrentan muchos habitantes de Carolina del Norte, especialmente los marginados o empobrecidos. El Departamento de Agricultura de Estados Unidos (USDA) define la seguridad alimentaria como "el acceso de todas las personas en todo momento a alimentos suficientes para llevar una vida activa y sana." Seg\u00fan esta definici\u00f3n, decenas de miles de habitantes de Carolina del Norte se enfrentan a la inseguridad alimentaria, ya que luchan por acceder a alimentos sanos y nutritivos de forma regular. Esto es especialmente cierto para los grupos marginados, las comunidades de bajos ingresos y los que viven en desiertos de alimentos.',
          'Nuestro programa de Alimentaci\u00f3n y Nutrici\u00f3n ha sido decisivo para aumentar el acceso a la nutrici\u00f3n y abordar el problema de la inseguridad alimentaria de los habitantes de Carolina del Norte m\u00e1s desfavorecidos. A trav\u00e9s de asociaciones con agricultores locales, tiendas de comestibles y organizaciones comunitarias, hemos sido capaces de proporcionar acceso a productos frescos y saludables y otras opciones de alimentos nutritivos a los necesitados. Las familias que antes ten\u00edan dificultades para llevar comida a la mesa ahora tienen acceso a opciones alimentarias nutritivas y de alta calidad, lo que puede repercutir positivamente en su bienestar f\u00edsico, emocional y mental. Adem\u00e1s, al apoyar a los agricultores y productores de alimentos locales, contribuimos a reforzar la econom\u00eda local y a crear sistemas alimentarios sostenibles que benefician a todos.',
          'Nuestro programa no s\u00f3lo proporciona alimentos, sino tambi\u00e9n educaci\u00f3n y recursos para ayudar a personas y familias a elegir alimentos sanos y sostenibles. Esto incluye clases de cocina, talleres de nutrici\u00f3n e informaci\u00f3n sobre recursos alimentarios locales. Al centrarnos en la educaci\u00f3n y accesos, estamos creando soluciones a largo plazo para la inseguridad alimentaria y promoviendo la salud y el bienestar en las comunidades a las que servimos.',
          'Le instamos a que se una a nosotros en nuestra misi\u00f3n de hacer frente a la inseguridad alimentaria y promover el acceso a opciones alimentarias saludables para las comunidades desfavorecidas. Su apoyo puede marcar una diferencia significativa en la vida de las personas que luchan por llevar comida a la mesa y acceder a opciones nutritivas. Considere la posibilidad de hacer una donaci\u00f3n a nuestro programa de alimentos o de ofrecer su tiempo como voluntario para ayudar en la distribuci\u00f3n de alimentos, clases de cocina o talleres de nutrici\u00f3n. Tambi\u00e9n puedes apoyarnos comprando en mercados de agricultores y tiendas de comestibles locales que den prioridad a la producci\u00f3n y distribuci\u00f3n de alimentos sostenibles y \u00e9ticos. Juntos podemos construir un sistema alimentario m\u00e1s sano y justo que beneficie a todos.',
        ],
        image: '/wl4wj/programs/food/produce.jpg',
        imageAlt: 'Productos frescos del programa de Alimentaci\u00f3n y Nutrici\u00f3n de MLPBJ',
        accent: '#34C759',
      },
      {
        id: 'chws',
        eyebrow: 'Bienestar',
        title: 'Agentes de Salud Comunitarios',
        heading: 'Conectando',
        stat: 'Relaciones de confianza y el respeto.',
        paragraphs: [
          'El agente de salud comunitario (ASC) es un agente de salud p\u00fablica de primera l\u00ednea con un profundo conocimiento y conexi\u00f3n con la comunidad a la que sirve. Las relaciones que establecen estos trabajadores se basan en la confianza y el respeto, lo que les permite ser defensores eficaces y sistemas de apoyo para las personas y las familias de las comunidades. Los ASC ponen en contacto a los habitantes de Carolina del Norte con recursos de apoyo m\u00e9dico y social, como vacunas, informaci\u00f3n sanitaria, viviendas asequibles y transporte. En MLPBJ nuestros ASC se comprometen a garantizar que nuestras comunidades tengan igualdad de acceso a estos recursos y a otros que ayudan a las personas y a las familias a prosperar. Para conectar a las personas con los recursos que tanto necesitan, nuestro equipo de CHW colabora con varios grupos y organizaciones de base para ampliar continuamente nuestros recursos de referencia.',
          'Gracias a su trabajo y experiencia, nuestros ASC han mejorado los resultados sanitarios y reducido las carencias sanitarias en las comunidades a las que atienden. Al proporcionar educaci\u00f3n sobre medidas preventivas de salud nuestros ASCs han ayudado a las personas a controlar enfermedades y prevenir la aparici\u00f3n de nuevos problemas de salud. Nuestros ASC tambi\u00e9n han trabajado para aumentar el acceso a los servicios sanitarios poniendo en contacto a las personas con proveedores m\u00e9dicos y otros recursos. Adicionalmente, nuestros ASC preparan a las personas para luchar por su salud, capacit\u00e1ndolas para desempe\u00f1ar un papel activo en su atenci\u00f3n sanitaria y para apoyar pol\u00edticas que mejoren la salud y el bienestar de sus comunidades.',
          'Le invitamos a unirse a nosotros para apoyar los esfuerzos de nuestros Agentes de Salud Comunitarios y el impacto que est\u00e1n teniendo en las comunidades desatendidas. Su apoyo puede ayudarnos a ampliar nuestro alcance y proporcionar m\u00e1s educaci\u00f3n, divulgaci\u00f3n y apoyo a quienes m\u00e1s lo necesitan. Juntos podemos reducir las desigualdades sanitarias y promover la equidad en salud para todas las personas, independientemente de su origen o situaci\u00f3n socioecon\u00f3mica. Podemos crear un futuro m\u00e1s sano y equitativo para todos. Considere la posibilidad de hacer una donaci\u00f3n o colaborar como voluntario con MLPBJ para ayudarnos a cumplir nuestra misi\u00f3n y marcar una diferencia significativa en las vidas de las personas a las que servimos.',
        ],
        image: '/wl4wj/programs/chw/chw.png',
        imageAlt: 'Agentes de Salud Comunitarios de MLPBJ',
        accent: '#0071E3',
      },
      {
        id: 'education',
        eyebrow: 'Justicia',
        title: 'Educaci\u00f3n y Defensa',
        heading: 'Perspectiva',
        stat: 'Promovemos la transparencia y la equidad en el gobierno.',
        paragraphs: [
          'Una democracia saludable requiere la participaci\u00f3n activa de sus ciudadanos para garantizar que los funcionarios electos y los representantes del gobierno sigan siendo responsables y transparentes. Responsabilizar a los funcionarios por sus acciones e inacciones es esencial para prevenir los abusos de poder y garantizar que la legislaci\u00f3n represente los intereses del p\u00fablico. Desafortunadamente, no es raro que aquellos en el poder prioricen los intereses personales sobre los de las comunidades a las que sirven. Por lo tanto, las personas deben monitorear y examinar las acciones de los funcionarios electos y los funcionarios designados entre elecciones. Aqu\u00ed es donde tomamos la iniciativa.',
          'Mujeres l\u00edderes est\u00e1 comprometida a mantenerse al d\u00eda sobre los temas que afectan a las comunidades a las que servimos, lo que se evidencia por nuestro seguimiento exhaustivo de las actividades legislativas y judiciales a nivel local, estatal y nacional. Monitoreamos de cerca las acciones de los funcionarios electos y designados, particularmente aquellos que pueden afectar a las comunidades desatendidas y marginadas. Hacemos esto para poder ser responsables con nuestro an\u00e1lisis de la informaci\u00f3n que recopilamos y brindar contexto y perspectiva a las personas para que puedan tomar decisiones pol\u00edticas informadas. Al proporcionar informaci\u00f3n completa y f\u00e1cil de asimilar sobre temas complejos a trav\u00e9s de nuestros medios en varias plataformas sociales, MLPBJ aumenta la conciencia y moviliza a los miembros de la comunidad en torno a causas importantes. Informando a las personas a las que servimos, las inspiramos para que act\u00faen y hagan girar las ruedas del cambio, conduciendo a un futuro mejor para todos.',
          'Creemos que es imprescindible que la gente se mantenga informada y participe en el proceso pol\u00edtico m\u00e1s all\u00e1 de emitir su voto. Observando y responsabilizando a los gobernantes, podemos contribuir a garantizar que nuestras comunidades est\u00e9n representadas y protegidas. Lo hacemos recopilando, contextualizando y difundiendo informaci\u00f3n imparcial, precisa y oportuna que permita a la gente tomar decisiones en base a la informaci\u00f3n. Le invitamos a unirse a nosotros en nuestros esfuerzos por mantenernos informados y comprometidos con el proceso pol\u00edtico. Con su apoyo, podremos seguir investigando y produciendo medios de comunicaci\u00f3n que inspiren a la gente a actuar y crear un cambio positivo.',
        ],
        image: '/wl4wj/programs/education/cameras.jpg',
        imageAlt: 'Trabajo de medios y defensa en MLPBJ',
        accent: '#FF9500',
      },
      {
        id: 'gotv',
        eyebrow: 'Justicia',
        title: 'Salir a Votar',
        heading: 'Cada Voz',
        stat: 'Lev\u00e1ntate. Permanezcan juntos. Fortalecer nuestra democracia para las generaciones venideras.',
        paragraphs: [
          'En los \u00faltimos a\u00f1os han aumentado considerablemente los esfuerzos por limitar la participaci\u00f3n electoral de las personas de comunidades marginadas. Las leyes restrictivas de identificaci\u00f3n de votantes, la supresi\u00f3n de las listas de votantes, la reducci\u00f3n de los d\u00edas de votaci\u00f3n anticipada y de los lugares de votaci\u00f3n, la manipulaci\u00f3n de los distritos electorales y la desinformaci\u00f3n, afectan de manera desproporcionada a las comunidades de color, a las personas con bajos ingresos y a otros grupos marginados que ya se enfrentan a obst\u00e1culos en el sistema para acceder a las urnas.',
          'Mujeres Liderando reconoce la importancia del compromiso c\u00edvico. Una de las caracter\u00edsticas \u00fanicas de la campa\u00f1a GOTV de Mujeres Liderando es nuestro \u00e9nfasis no solo en las elecciones presidenciales, sino tambi\u00e9n en las locales y estatales. Reconocemos que la legislaci\u00f3n aprobada por los funcionarios locales y estatales tiene un impacto significativo en la vida cotidiana de las personas, desde las decisiones de los consejos escolares hasta las pol\u00edticas de vivienda y las pr\u00e1cticas de aplicaci\u00f3n de la ley. Por ello, Women Leading proporciona recursos y apoyo a las personas para que conozcan a los funcionarios locales y estatales, se comprometan con ellos y les pidan cuentas de sus actos. Al empoderar a las personas para que participen activamente en el proceso democr\u00e1tico, Mujeres Liderando ayuda a garantizar que se escuchen las voces de las comunidades marginadas y que se atiendan sus necesidades.',
          'Una vez m\u00e1s, no se puede exagerar lo suficiente la importancia del compromiso c\u00edvico y la participaci\u00f3n en nuestra democracia. Es por eso que le instamos a que apoye la labor fundamental de MLPBJ en la educaci\u00f3n y movilizaci\u00f3n de los votantes de comunidades marginadas y desatendidas. Uni\u00e9ndote a nuestros esfuerzos, puedes contribuir a garantizar que todo el mundo pueda acceder a la informaci\u00f3n, los recursos y el apoyo que necesita para ejercer su derecho al voto. Ya sea que ofrezca su tiempo como voluntario, donando o simplemente haciendo correr la voz sobre nuestras iniciativas de educaci\u00f3n electoral y GOTV, su contribuci\u00f3n puede marcar una diferencia real. Juntos, podemos ayudar a construir una sociedad m\u00e1s justa y equitativa en la que cada voz sea escuchada y cada voto cuente.',
        ],
        image: '/wl4wj/programs/gotv/voter.jpg',
        imageAlt: 'Una votante participando en el proceso democr\u00e1tico',
        accent: '#AF52DE',
      },
      {
        id: 'coalition',
        eyebrow: 'Justicia',
        title: 'Formaci\u00f3n de Coaliciones',
        heading: 'Unidad',
        paragraphs: [
          'Mujeres Liderando ha avanzado mucho en la creaci\u00f3n de una alianza de grupos afines para aumentar nuestra fuerza colectiva. Esta alianza puede llegar a un p\u00fablico m\u00e1s amplio y superar retos complejos que afectan a comunidades marginadas y desatendidas y que habr\u00edan sido mucho m\u00e1s dif\u00edciles de abordar en solitario. Cuando se unen grupos de base con objetivos y valores similares, su fuerza colectiva puede ser mayor que la suma de sus partes. Al aprovechar estas fuerzas colectivas, recursos, habilidades y experiencia, nuestra coalici\u00f3n ha permitido aumentar la capacidad y el alcance a medida que aprendemos, compartimos y desarrollamos un movimiento m\u00e1s diverso e inclusivo.',
          'Si usted es una organizaci\u00f3n de ideas afines que trabaja hacia objetivos similares, le instamos a unirse a nuestra coalici\u00f3n y fortalecer nuestro impacto colectivo. Juntos, podemos crear una sociedad m\u00e1s equitativa y justa al unir nuestros recursos, habilidades y conexiones para impulsar un cambio significativo. Adem\u00e1s, le animamos que considere apoyar a MLPBJ directamente a trav\u00e9s de fondos, voluntariado u otros medios. Al hacerlo, nos ayudar\u00e1 a continuar haciendo crecer nuestra red y el impacto positivo que podemos tener en las personas necesitadas.',
        ],
        image: '/wl4wj/programs/coalition/group.jpg',
        imageAlt: 'Socios de la coalici\u00f3n de MLPBJ reunidos',
        accent: '#FF3B30',
      },
    ] as ProgramSection[],
    about: {
      eyebrow: 'Organizaci\u00f3n',
      title: 'Historia',
      heading: 'Esforzarse',
      paragraphs: [
        'Nuestras fundadoras, Ana Ilarraza-Blackburn y Kim Porter, se conocieron cuando fueron nombradas Enlace de Inmigrantes Latinos y Presidenta de Justicia Medioambiental y Clim\u00e1tica de la NAACP de Carolina del Norte, respectivamente. Durante varios a\u00f1os, desarrollaron una relaci\u00f3n de trabajo centrada en el apoyo, el aliento y la pasi\u00f3n por la justicia social que continu\u00f3 m\u00e1s all\u00e1 de su tiempo como funcionarios designados en la NAACP de Carolina del Norte. En su trabajo con otras organizaciones del \u00e1mbito de la justicia social, ambas empezaron a notar un patr\u00f3n de relegaci\u00f3n de las mujeres a un segundo plano en los procesos de toma de decisiones, a pesar de sus capacidades. Aunque valoradas y utilizadas por su influencia y sus habilidades, muchas de estas mujeres no recibieron reconocimiento por estos atributos y sus logros. Nuestras fundadoras trataron de resolver este problema con la creaci\u00f3n de Mujeres Liderando.',
        'Con el establecimiento de Mujeres Liderando, nuestras fundadoras han creado un espacio donde las mujeres l\u00edderes son alentadas, apoyadas y reconocidas por el trabajo diligente que han hecho y contin\u00faan haciendo. Gran parte de ese trabajo ocurre dentro de nuestros programas de bienestar y justicia, donde servimos a otros necesitados al proporcionar acceso a recursos, alimentos saludables, asesoramiento y recursos para votar. Gracias a la dedicaci\u00f3n de nuestro personal, voluntarios y simpatizantes, exigimos cambios para los m\u00e1s pobres y desfavorecidos de nuestro estado y de otros lugares.',
      ],
      missionTitle: 'Declaraci\u00f3n de misi\u00f3n',
      mission: 'Mujeres liderando por el Bienestar y la Justicia busca proporcionar a las comunidades desatendidas un acceso m\u00e1s equitativo a la informaci\u00f3n, materiales y sistemas de apoyo en relaci\u00f3n con la atenci\u00f3n m\u00e9dica, la seguridad alimentaria y el bienestar integral a trav\u00e9s de cl\u00ednicas, seminarios y abogac\u00eda.',
      visionTitle: 'Visi\u00f3n',
      vision: 'El talento y la capacidad de liderazgo de las mujeres han sido esenciales en varios movimientos sociales de \u00e9xito, y seguir\u00e1n si\u00e9ndolo en el futuro. Sin embargo, es necesario estimular y apoyar a estas l\u00edderes para que desarrollen todo su potencial. Es por eso que se fund\u00f3 Mujeres Liderando, no solo para reconocer y celebrar a las mujeres l\u00edderes del pasado y del presente, sino para equipar a nuevas l\u00edderes para el futuro. A trav\u00e9s de oportunidades de servicio, educaci\u00f3n y defensa, ayudamos a las personas necesitadas, apoyamos a las personas que hacen el trabajo y empoderamos a otros que, a su vez, empoderan a sus comunidades, causando un efecto domin\u00f3 de movilizaci\u00f3n y cambio social positivo.',
      valuesTitle: '4 Valores Fundamentales',
      valuesIntro: 'El trabajo por la justicia social tiene el potencial de ser muy agotador en s\u00ed mismo. Combatimos esta realidad firmemente con estos 4 valores fundamentales:',
      values: [
        {
          title: 'Escucha integral',
          body: 'Escuchamos las ideas y preocupaciones de todos los que se prestan a esta labor. Esto incluye al personal, a los voluntarios, a las organizaciones asociadas y a las personas por las que abogamos. Sin escuchar, no hay comprensi\u00f3n. Sin comprensi\u00f3n, no hay una ejecuci\u00f3n adecuada. Sin una ejecuci\u00f3n adecuada, no hay progreso.',
        },
        {
          title: 'Honrando a las manos que trabajan',
          body: 'Entendemos que muchos grandes movimientos sociales del pasado y del presente han tenido \u00e9xito debido a las ideas, la implementaci\u00f3n y el liderazgo de personas que no fueron debidamente reconocidas. En Mujeres Liderando, tratamos de cambiar ese elemento de la cultura de justicia social honrando las manos que trabajan y reconociendo a los voluntarios, al personal y a las organizaciones asociadas por lo que aportan a la misi\u00f3n.',
        },
        {
          title: 'Creaci\u00f3n de alianzas',
          body: 'Nos esforzamos por apoyar a las personas, organizaciones y trabajos que coinciden con nuestra misi\u00f3n y visi\u00f3n. El poder para implementar un cambio duradero se adquiere colectivamente, por lo que soportamos el peso de nuestra misi\u00f3n con el apoyo de los dem\u00e1s.',
        },
        {
          title: 'Bienestar interno',
          body: 'Creemos en la promoci\u00f3n de un sentido integral del bienestar, que incluya el bien f\u00edsico, mental y emocional. Sin embargo, antes de esperar ver esto en la sociedad en general, tenemos la costumbre de modelarlo dentro de Mujeres Liderando. Animamos a todo el personal y a los voluntarios a que dediquen tiempo a "llenarse de energ\u00eda" para estar bien y ofrecer la mejor versi\u00f3n de s\u00ed mismos. Nos negamos a crear una disparidad para remediar otra.',
        },
      ],
      valuesCoda: 'Escuchamos, entendemos, nos esforzamos por creer, somos MLPBJ.',
    },
    leadershipTitle: 'Directivos',
    staff: [
      {
        name: 'Kim Porter',
        role: 'Co-Directora Ejecutiva',
        image: '/wl4wj/about/staff/kim-porter.jpg',
        bio: 'Kim Porter es nativa de Carolina del Norte y vive en Winston-Salem. Cuenta con una amplia experiencia de 30 a\u00f1os de carrera en el \u00e1mbito de los servicios sociales, la justicia social y la defensa de derechos. Al principio de su carrera, Kim puso en contacto a familias con recursos sociales muy necesarios como gestora de programas y trabajadora social de la Universidad Estatal de los Apalaches. Posteriormente, fue Directora Ejecutiva de Triad Counseling Services, donde atendi\u00f3 a personas con problemas de salud mental en las zonas de Greensboro y High Point. Despu\u00e9s de este compromiso, su trabajo pasar\u00eda a la justicia social y la defensa. En 2014, mientras trabajaba como organizadora comunitaria con Democracy NC y NC Warn, Kim fue nombrada presidenta de Justicia Ambiental y Clim\u00e1tica de la NAACP de Carolina del Norte. Kim actualmente es miembro del comit\u00e9 coordinador de la Campa\u00f1a de los Pobres de Carolina del Norte y en la junta directiva de Community Roots y Renew Forsyth.',
      },
      {
        name: 'Ana Blackburn',
        role: 'Co-Directora Ejecutiva',
        image: '/wl4wj/about/staff/ana-blackburn.jpg',
        bio: 'Ana Ilarraza-Blackburn naci\u00f3 en Brooklyn (Nueva York) y se cri\u00f3 en Chicago. Es la fundadora y presidenta de Response Management Training y ha utilizado sus 15 a\u00f1os de experiencia como socorrista para capacitar a otros en medicina de emergencia durante m\u00e1s de 20 a\u00f1os. Ana es tambi\u00e9n el primer enlace de inmigrantes latinos para la NAACP de Carolina del Norte y una de las tres presidentas originales de Carolina del Norte para la Campa\u00f1a de los Pobres: A National Call For Moral Revival. Durante la pandemia de COVID-19, Ana sirvi\u00f3 a las comunidades negra, morenas e inmigrante cuando dirigi\u00f3 el programa de trabajadores sanitarios comunitarios (CHW) en Sandhills, Carolina del Norte. Los CHW proporcionaron vacunaci\u00f3n y acceso sanitario a las comunidades negra, morenos e inmigrante de Sandhills. En seis meses, el equipo de CHW dio acceso a m\u00e1s de 10.000 personas.',
      },
      {
        name: 'Trey Irby',
        role: 'Director de Comunicaciones',
        image: '/wl4wj/about/staff/trey-irby.jpg',
        bio: 'Trey Irby es nativo de Asheville, Carolina del Norte, y graduado de la Universidad Estatal T\u00e9cnica y Agr\u00edcola de Carolina del Norte. All\u00ed se licenci\u00f3 en Relaciones P\u00fablicas con especializaci\u00f3n en Ciencias Pol\u00edticas. Tiene experiencia en marketing y comunicaciones para organizaciones con y sin fines de lucro. Su pasi\u00f3n por la justicia social nace del deseo de que todas las personas tengan acceso a las necesidades b\u00e1sicas. \u00c9l cree que \u201cno deber\u00eda exigirse un esfuerzo extraordinario para vivir una vida ordinaria.\u201d',
      },
      { name: 'Debra Lee', role: 'CHW Certificada', image: '/wl4wj/about/staff/debra-lee.jpg' },
      { name: 'Carla M. Judd', role: 'CHW Certificada', image: '/wl4wj/about/staff/carla-judd.jpg' },
      { name: 'Zachary Krenzler', role: 'CHW Certificado', image: '/wl4wj/about/staff/zach-krenzler.jpg' },
      { name: 'Minerva Cisneros Garcia', role: 'CHW Certificada', image: '/wl4wj/about/staff/minerva-garcia.jpg' },
      { name: 'Brian Stitt', role: 'CHW Certificado', image: '/wl4wj/about/staff/brian-stitt.jpg' },
      { name: 'Karina Lane-Mu\u00f1oz Olmedo', role: 'CHW Certificada', image: '/wl4wj/about/staff/karina-lane.jpg' },
    ] as Person[],
    boardTitle: 'Consejo de Administraci\u00f3n',
    board: [
      {
        name: 'Geeta Kapur',
        role: 'Abogada de derechos civiles y defensa penal',
        image: '/wl4wj/about/board/geeta-kapur.jpg',
        bio: 'Geeta N. Kapur es originaria de Kenia y actualmente vive en Durham, Carolina del Norte. Es una abogada experimentada en derechos civiles y defensa penal que ha dedicado su carrera a defender a las minor\u00edas raciales pobres y oprimidas y ha argumentado casos constitucionales hist\u00f3ricos ante la Corte Suprema de Carolina del Norte. Por su trabajo, ha sido reconocida por la Asociaci\u00f3n Nacional de Abogados Litigantes como una de las 100 mejores abogadas de defensa criminal en Carolina del Norte. Adem\u00e1s, Geeta fue el principal abogado pro bono de las protestas de NAACP Moral Monday de Carolina del Norte. Posteriormente, recibi\u00f3 el prestigioso Premio Humanitario del A\u00f1o de la NAACP de Carolina del Norte por su servicio.',
      },
      {
        name: 'Olinda Watkins-McSurely',
        role: 'Administradora de Educaci\u00f3n',
        image: '/wl4wj/about/board/olinda-watkins.jpg',
        bio: 'O\'Linda Watkins-McSurely es natural del condado de Moore y ha vivido en Carthage toda su vida. Trabaj\u00f3 en la Oficina de Escuelas P\u00fablicas Aut\u00f3nomas del Departamento de Educaci\u00f3n P\u00fablica y ayud\u00f3 a crear escuelas auton\u00f3micas en Carolina del Norte como asistente administrativa. O\'Linda ha formado parte de muchas juntas en el condado de Moore y ha sido miembro activo de la NAACP durante 36 a\u00f1os, llegando incluso a ser Presidenta de la NAACP del condado de Moore durante 26 a\u00f1os. Ha recibido la Condecoraci\u00f3n del Long Leaf Pine y el Premio Susan B. Anthony otorgado por la alianza NC-ERA.',
      },
      {
        name: 'Eliazar Posada',
        role: 'Legislador y Empresario',
        image: '/wl4wj/about/board/eliazar-posada.jpg',
        bio: 'En 2016, Eliazar Posada se traslad\u00f3 a Carrboro, NC, y el 17 de mayo de 2022, se convirti\u00f3 en el primer latino abiertamente LGBTQ elegido en Carolina del Norte despu\u00e9s de ganar una elecci\u00f3n especial. Se desempe\u00f1a como Director Organizador de Igualdad NC y tambi\u00e9n es el fundador de Posada Strategy Consulting. Esta firma trabaja con organizaciones sin fines de lucro y de base para desarrollar capacidades, desarrollar programas y crear estrategias en torno a la recaudaci\u00f3n de fondos, divulgaci\u00f3n y promoci\u00f3n. Eliazar tambi\u00e9n ha recibido el Premio Frida Kahlo a la Trayectoria Profesional 2021 y el Premio Latino Diamante Latino Advocate 2021 por sus servicios a la comunidad.',
      },
      {
        name: 'Elena J. Ceberio',
        role: 'Especialista en planificaci\u00f3n estrat\u00e9gica',
        image: '/wl4wj/about/board/elena-ceberio.jpg',
        bio: 'Elena J. Ceberio es una vasco-estadounidense de primera generaci\u00f3n cuya pasi\u00f3n por la justicia social proviene de su comprensi\u00f3n de las ramificaciones de la opresi\u00f3n generacional. Antes de su trabajo como organizadora, Elena ocup\u00f3 el cargo de directora de planificaci\u00f3n de materiales en una gran empresa de distribuci\u00f3n. En este puesto, fue responsable de la planificaci\u00f3n a largo plazo, la gesti\u00f3n de procesos y el lanzamiento de una divisi\u00f3n de 1.700 millones de d\u00f3lares del grupo minorista. Su labor organizativa abarca formar parte de un equipo que distribuy\u00f3 m\u00e1s de 38 toneladas de alimentos durante la pandemia de COVID-19. Tambi\u00e9n realizaron eventos de regreso a clases donde proporcionaron m\u00e1s de 1200 mochilas llenas de \u00fatiles escolares, \u00a1atendiendo las necesidades de 2.265 familias! Adem\u00e1s, Elena ha desempe\u00f1ado funciones de liderazgo en organizaciones de justicia social reconocidas a nivel nacional y es miembro activo de su iglesia.',
      },
      {
        name: 'Steve Blackburn',
        role: 'Administrador de Servicios de Emergencia',
        bio: 'Steve Blackburn es nativo de Carolina del Norte y cuenta con una amplia experiencia en gesti\u00f3n de proyectos y pasi\u00f3n por el compromiso c\u00edvico. Ha dirigido m\u00e1s de 200 empleados y fue responsable fiscalmente de administrar m\u00e1s de 200 millones de d\u00f3lares en activos. Despu\u00e9s de 31 a\u00f1os como Jefe de Bomberos de Fort Bragg y Pope Army Air Field y 25 a\u00f1os como Jefe de Bomberos Adjunto del Distrito de Bomberos de Bonnie Doone en el Condado de Cumberland, Steve se retir\u00f3. M\u00e1s tarde se convertir\u00eda en miembro de la Junta Electoral del condado de Harnett, con el fin de crear un cambio sist\u00e9mico para la mejora moral y constitucional del condado.',
      },
      {
        name: 'Paola Rodriguez',
        role: 'Miembro del Consejo',
        image: '/wl4wj/about/board/paola-rodriguez.jpg',
      },
    ] as Person[],
    footer: {
      tagline: 'Mujeres Liderando por el Bienestar y la Justicia',
      platform: 'Con tecnolog\u00eda de CHWOne',
      signIn: 'Iniciar Sesi\u00f3n',
      chwone: 'Plataforma CHWOne',
      rights: 'Todos los derechos reservados.',
    },
  },
} as const;
