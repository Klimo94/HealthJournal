document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('measurement-form');
    const measurementsList = document.getElementById('measurements-list');
    const canvas = document.getElementById('healthChart');
    const langSwitcher = document.getElementById('language-switcher');
    let healthChart;

    const textContent = {
        en: {
            title: "Health Journal",
            date: "Date",
            bloodPressure: "Blood Pressure",
            bloodSugar: "Blood Sugar (mg/dL)",
            submitButton: "Add Measurement",
            chartTitle: "Health Measurements Over Time",
            lowBloodPressure: "Low blood pressure.",
            highBloodPressure: "High blood pressure.",
            lowBloodSugar: "Low blood sugar.",
            highBloodSugar: "High blood sugar.",
            reduceActivity: "Consider reducing physical activity and stay hydrated.",
            takeMedsPressure: "Consider taking your blood pressure medication.",
            takeMedsSugar: "Consider taking your diabetes medication and stay hydrated.",
            eatSnack: "Consider eating a small snack with carbohydrates."
        },
        pl: {
            title: "Dziennik Zdrowia",
            date: "Data",
            bloodPressure: "Ciśnienie Krwi",
            bloodSugar: "Poziom Cukru (mg/dL)",
            submitButton: "Dodaj Pomiar",
            chartTitle: "Pomiary Zdrowotne w Czasie",
            lowBloodPressure: "Niskie ciśnienie krwi.",
            highBloodPressure: "Wysokie ciśnienie krwi.",
            lowBloodSugar: "Niski poziom cukru.",
            highBloodSugar: "Wysoki poziom cukru.",
            reduceActivity: "Zmniejsz aktywność fizyczną i nawadniaj się.",
            takeMedsPressure: "Zażyj leki na nadciśnienie.",
            takeMedsSugar: "Zażyj leki na cukrzycę i nawadniaj się.",
            eatSnack: "Zjedz przekąskę bogatą w węglowodany."
        }
    };

    let currentLanguage = 'en';

    const updateLanguage = (lang) => {
        console.log("Zmieniam język na:", lang);
        currentLanguage = lang;
        console.log("Aktualny język:", currentLanguage);
        document.getElementById('title').textContent = textContent[lang].title;
        document.getElementById('label-date').textContent = textContent[lang].date + ":";
        document.getElementById('label-bloodPressure').textContent = textContent[lang].bloodPressure + ":";
        document.getElementById('label-bloodSugar').textContent = textContent[lang].bloodSugar + ":";
        document.getElementById('submit-button').textContent = textContent[lang].submitButton;
        document.getElementById('chart-title').textContent = textContent[lang].chartTitle;
        document.getElementById('lang-en').addEventListener('click', () => updateLanguage('en'));
        document.getElementById('lang-pl').addEventListener('click', () => updateLanguage('pl'));

        fetchMeasurements();
    };

    if (canvas) {
        const ctx = canvas.getContext('2d');

        const fetchMeasurements = async () => {
            console.log("Fetch measurements dla języka:", currentLanguage);
            const response = await fetch('/measurements');
            const measurements = await response.json();

            measurementsList.innerHTML = '';
            measurements.forEach(measurement => {
                const { warningClass, message, recommendation } = checkMeasurements(measurement);
                const li = document.createElement('li');
                li.innerHTML = `<strong>${textContent[currentLanguage].date}:</strong> ${measurement.date}, 
                    <span class="${warningClass}"><strong>${textContent[currentLanguage].bloodPressure}:</strong> ${measurement.bloodPressure}, 
                    <strong>${textContent[currentLanguage].bloodSugar}:</strong> ${measurement.bloodSugar}</span>
                    ${message ? `<br><span class="warning">${message}</span>` : ''}
                    ${recommendation ? `<br><span class="recommendation">${recommendation}</span>` : ''}`;
                measurementsList.appendChild(li);
            });

            updateChart(measurements);
        };

        const checkMeasurements = (measurement) => {
            const [systolic, diastolic] = measurement.bloodPressure.split('/').map(Number);
            const bloodSugar = measurement.bloodSugar;
            let isNormal = true;
            let message = '';
            let recommendation = '';

            if (systolic < 90 || diastolic < 60) {
                isNormal = false;
                message += textContent[currentLanguage].lowBloodPressure + " ";
                recommendation += textContent[currentLanguage].reduceActivity + " ";
            } else if (systolic > 140 || diastolic > 90) {
                isNormal = false;
                message += textContent[currentLanguage].highBloodPressure + " ";
                recommendation += textContent[currentLanguage].takeMedsPressure + " ";
            }

            if (bloodSugar < 70) {
                isNormal = false;
                message += textContent[currentLanguage].lowBloodSugar + " ";
                recommendation += textContent[currentLanguage].eatSnack + " ";
            } else if (bloodSugar > 130) {
                isNormal = false;
                message += textContent[currentLanguage].highBloodSugar + " ";
                recommendation += textContent[currentLanguage].takeMedsSugar + " ";
            }

            return {
                warningClass: isNormal ? 'normal' : 'warning',
                message: message.trim(),
                recommendation: recommendation.trim()
            };
        };

        const updateChart = (measurements) => {
            const labels = measurements.map(m => m.date);
            const bloodPressureData = measurements.map(m => parseInt(m.bloodPressure.split('/')[0])); // Use systolic pressure
            const bloodSugarData = measurements.map(m => m.bloodSugar);

            if (healthChart) {
                healthChart.destroy();
            }

            healthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: textContent[currentLanguage].bloodPressure,
                        data: bloodPressureData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        fill: false
                    },
                    {
                        label: textContent[currentLanguage].bloodSugar,
                        data: bloodSugarData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: textContent[currentLanguage].date
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: textContent[currentLanguage].chartTitle
                            }
                        }
                    }
                }
            });
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newMeasurement = {
                date: document.getElementById('date').value,
                bloodPressure: document.getElementById('bloodPressure').value,
                bloodSugar: document.getElementById('bloodSugar').value
            };

            await fetch('/measurements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMeasurement),
            });

            form.reset();
            fetchMeasurements();
        });

        fetchMeasurements();
    } else {
        console.error("Element canvas o id 'healthChart' nie został znaleziony.");
    }

    document.getElementById('lang-en').addEventListener('click', () => updateLanguage('en'));
    document.getElementById('lang-pl').addEventListener('click', () => updateLanguage('pl'));
});
