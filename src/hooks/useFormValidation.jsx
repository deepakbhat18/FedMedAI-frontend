import { useState, useCallback } from 'react';

const MEDICAL_RANGES = {
  age:           { min: 0,    max: 120,  unit: 'years',  label: 'Age'           },
  bloodPressure: { min: 60,   max: 250,  unit: 'mmHg',   label: 'Blood Pressure'},
  cholesterol:   { min: 100,  max: 500,  unit: 'mg/dl',  label: 'Cholesterol'   },
  heartRate:     { min: 30,   max: 250,  unit: 'bpm',    label: 'Heart Rate'    },
  bmi:           { min: 10,   max: 70,   unit: 'kg/m²',  label: 'BMI'           },
  glucose:       { min: 40,   max: 600,  unit: 'mg/dl',  label: 'Glucose'       },
  creatinine:    { min: 0.1,  max: 20,   unit: 'mg/dl',  label: 'Creatinine'    },
  hemoglobin:    { min: 3,    max: 20,   unit: 'g/dl',   label: 'Hemoglobin'    },
  bilirubin:     { min: 0,    max: 30,   unit: 'mg/dl',  label: 'Bilirubin'     },
  altEnzyme:     { min: 0,    max: 500,  unit: 'U/L',    label: 'ALT Enzyme'    },
  albumin:       { min: 1,    max: 6,    unit: 'g/dl',   label: 'Albumin'       },
  potassium:     { min: 1,    max: 10,   unit: 'mEq/L',  label: 'Potassium'     },
  sodium:        { min: 100,  max: 180,  unit: 'mEq/L',  label: 'Sodium'        },
  urea:          { min: 5,    max: 300,  unit: 'mg/dl',  label: 'Urea'          },
};

const NORMAL_RANGES = {
  bloodPressure: '60-120',
  cholesterol:   '< 200',
  heartRate:     '60-100',
  bmi:           '18.5-24.9',
  glucose:       '70-100',
  creatinine:    '0.6-1.2',
  hemoglobin:    '12-17.5',
  bilirubin:     '0.1-1.2',
  altEnzyme:     '< 40',
  albumin:       '3.5-5',
  potassium:     '3.5-5',
  sodium:        '136-145',
  urea:          '7-25',
};

export const useFormValidation = () => {
  const [errors,   setErrors]   = useState({});
  const [warnings, setWarnings] = useState({});

  const validateField = useCallback((name, value) => {
    const newErrors   = { ...errors };
    const newWarnings = { ...warnings };

    delete newErrors[name];
    delete newWarnings[name];

    if (!value && value !== 0) {
      setErrors(newErrors);
      setWarnings(newWarnings);
      return;
    }

    const numVal = parseFloat(value);
    const range  = MEDICAL_RANGES[name];

    if (range && !isNaN(numVal)) {
      if (numVal < range.min || numVal > range.max) {
        newErrors[name] =
          `${range.label} must be between ${range.min} and ${range.max} ${range.unit}`;
      } else {
        
        const normal = NORMAL_RANGES[name];
        if (normal && name === 'bloodPressure' && numVal > 140) {
          newWarnings[name] = `High blood pressure (normal: ${normal} mmHg)`;
        } else if (name === 'glucose' && numVal > 126) {
          newWarnings[name] = `High glucose level (normal: ${normal} mg/dl)`;
        } else if (name === 'cholesterol' && numVal > 200) {
          newWarnings[name] = `High cholesterol (normal: ${normal} mg/dl)`;
        } else if (name === 'bmi' && numVal > 30) {
          newWarnings[name] = `Obese BMI (normal: ${normal} kg/m²)`;
        } else if (name === 'creatinine' && numVal > 1.2) {
          newWarnings[name] = `High creatinine (normal: ${normal} mg/dl)`;
        } else if (name === 'bilirubin' && numVal > 1.2) {
          newWarnings[name] = `High bilirubin (normal: ${normal} mg/dl)`;
        } else if (name === 'altEnzyme' && numVal > 40) {
          newWarnings[name] = `High ALT enzyme (normal: ${normal} U/L)`;
        }
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return !newErrors[name];
  }, [errors, warnings]);

  const validateAll = useCallback((formData) => {
    const newErrors = {};
    let isValid = true;

    Object.entries(formData).forEach(([name, value]) => {
      const range = MEDICAL_RANGES[name];
      if (range && value) {
        const numVal = parseFloat(value);
        if (!isNaN(numVal)) {
          if (numVal < range.min || numVal > range.max) {
            newErrors[name] =
              `${range.label}: ${range.min}-${range.max} ${range.unit}`;
            isValid = false;
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  const getNormalRange = (fieldName) => {
    return NORMAL_RANGES[fieldName] || null;
  };

  return {
    errors,
    warnings,
    validateField,
    validateAll,
    clearErrors,
    getNormalRange,
    MEDICAL_RANGES,
    NORMAL_RANGES,
  };
};