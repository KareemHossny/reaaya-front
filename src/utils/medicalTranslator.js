// قاموس الترجمة للكلمات الطبية المطلوبة فقط
const medicalDictionary = {
  // التخصصات المطلوبة
  'أنف وأذن وحنجره': 'Ear, Nose and Throat',
  'أنف وأذن وحنجرة': 'Ear, Nose and Throat',
  'أطفال': 'Pediatrics',
  'أسنان': 'Dentistry',
  'باطنة': 'Internal Medicine',
  'الجهاز الهضمي': 'Gastroenterology',
  'الجراحة العامة': 'General Surgery',
  'عيون': 'Ophthalmology',
  'جلدية': 'Dermatology',
  'جلدية وتناسلية': 'Dermatology and Venereology',
  'جراحة العظام': 'Orthopedic Surgery',
  'جراحة عظام': 'Orthopedic Surgery',
  'نساء والتوليد': 'Gynecology and Obstetrics',
  'نساء وتوليد': 'Gynecology and Obstetrics',
  'مخ وأعصاب': 'Neurology',
  'قلب وأوعية الدموية': 'Cardiology and Vascular',
  'قلب': 'Cardiology',
  
  // تخصصات إضافية شائعة
  'جراحة عامة': 'General Surgery',
  'جراحة القلب والصدر': 'Cardiothoracic Surgery',
  'أمراض القلب': 'Cardiology',
  'جراحة المخ والأعصاب': 'Neurosurgery',
  'جراحة المسالك البولية': 'Urology',
  'جراحة التجميل': 'Plastic Surgery',
  'جراحة الأوعية الدموية': 'Vascular Surgery',
  'جراحة الأطفال': 'Pediatric Surgery',
  'جراحة الوجه والفكين': 'Oral and Maxillofacial Surgery',
  'طب الأسرة': 'Family Medicine',
  'طب الطوارئ': 'Emergency Medicine',
  'طب العناية المركزة': 'Intensive Care Medicine',
  'طب الباطنة': 'Internal Medicine',
  'طب المسنين': 'Geriatrics',
  'طب الأعصاب': 'Neurology',
  'طب العظام': 'Orthopedics',
  'طب العيون': 'Ophthalmology',
  'طب الجلد': 'Dermatology',
  'طب النساء': 'Gynecology',
  'طب التوليد': 'Obstetrics',
  'طب الأطفال': 'Pediatrics',
  'طب الأسنان': 'Dentistry',
  
  // مصطلحات طبية عامة
  'طبيب عام': 'General Practitioner',
  'طبيب أسرة': 'Family Doctor',
  'استشاري': 'Consultant',
  'أخصائي': 'Specialist',
  'زميل': 'Fellow',
  'مقيم': 'Resident',
  'طبيب مقيم': 'Resident Doctor',
  
  // أقسام المستشفى
  'قسم الطوارئ': 'Emergency Department',
  'العناية المركزة': 'Intensive Care Unit',
  'قسم الباطنة': 'Internal Medicine Department',
  'قسم الجراحة': 'Surgery Department',
  'قسم الأطفال': 'Pediatrics Department',
  'قسم النساء': 'Gynecology Department',
  'قسم العيون': 'Ophthalmology Department',
  'قسم العظام': 'Orthopedics Department',
};

export const translateMedicalText = (text, currentLanguage) => {
  // إذا كانت اللغة عربية، أرجع النص كما هو
  if (currentLanguage === 'ar') {
    return text;
  }

  // إذا كانت اللغة إنجليزية، ابحث عن الكلمات المطلوبة فقط
  if (currentLanguage === 'en') {
    if (!text || typeof text !== 'string') return text;
    
    let translatedText = text;
    
    // ابحث عن كل كلمة في القاموس واستبدلها
    Object.keys(medicalDictionary).forEach(arabicWord => {
      if (translatedText.includes(arabicWord)) {
        const englishTranslation = medicalDictionary[arabicWord];
        translatedText = translatedText.replace(
          new RegExp(arabicWord, 'g'), 
          englishTranslation
        );
      }
    });
    
    return translatedText;
  }

  // لأي لغة أخرى، أرجع النص الأصلي
  return text;
};

// دالة مساعدة لترجمة تخصصات متعددة
export const translateSpecializations = (specializations, currentLanguage) => {
  if (!specializations || !Array.isArray(specializations)) return specializations;
  
  return specializations.map(spec => ({
    ...spec,
    name: translateMedicalText(spec.name, currentLanguage)
  }));
};

// دالة مساعدة لترجمة كائن الطبيب
export const translateDoctor = (doctor, currentLanguage) => {
  if (!doctor) return doctor;
  
  return {
    ...doctor,
    specialization: doctor.specialization ? {
      ...doctor.specialization,
      name: translateMedicalText(doctor.specialization.name, currentLanguage)
    } : doctor.specialization
  };
};
