document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const windSpeedElement = document.getElementById('text-wind');
    const windAlertElement = document.getElementById('text-wind-alert'); // Phần tử hiển thị cảnh báo sức gió
    const windAlertCard = document.getElementById('card-wind-alert'); // Thẻ cảnh báo
    const windAlertIcon = document.getElementById('wind-alert-icon'); // Icon cảnh báo sức gió
  
    let windSpeedData = JSON.parse(localStorage.getItem('windSpeedData')) || []; // Lưu dữ liệu sức gió vào localStorage
    let labelsData = [...Array(20).keys()]; // Allow for 20 entries
  
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsData,
            datasets: [{
                label: 'Sức gió (m/s)',
                data: windSpeedData,
                borderColor: 'rgba(255, 165, 0, 1)',
                backgroundColor: 'rgba(255, 165, 0, 0.2)',
                borderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    onClick: function(e, legendItem) {
                        const index = legendItem.datasetIndex;
                        const chart = this.chart;
                        const meta = chart.getDatasetMeta(index);
                        meta.hidden = !meta.hidden;
                        chart.update();
                    }
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
  
    // Hàm cập nhật dữ liệu sức gió
    async function fetchSensorData() {
        try {
            const response = await axios.get('/sensor-data');
            if (response.data.success) {
                const { windSpeed } = response.data;
    
                windSpeedElement.textContent = `${windSpeed} m/s`;
                windAlertElement.textContent = `${windSpeed} m/s`;
  
                windSpeedData.push(windSpeed);
                labelsData.push(labelsData[labelsData.length - 1] + 1);
                labelsData.shift();
                if (windSpeedData.length > 20) { // Retain 20 entries
                    windSpeedData.shift();
                }
  
                localStorage.setItem('windSpeedData', JSON.stringify(windSpeedData));
  
                if (windSpeed >= 60) {
                    windAlertCard.classList.add('blinking-background');
                    windAlertElement.textContent = `${windSpeed} m/s (Cảnh báo: Gió mạnh)`;
                    windAlertIcon.className = 'fas fa-exclamation-triangle'; // Đổi icon thành cảnh báo khi sức gió >= 60
                } else {
                    windAlertCard.classList.remove('blinking-background');
                    windAlertElement.textContent = `${windSpeed} m/s (an toàn)`;
                    windAlertIcon.className = 'fas fa-check-circle'; // Đổi icon thành an toàn khi sức gió < 60
                }
  
                myChart.update();
            } else {
                console.error('No sensor data available');
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
        }
    }
  
    fetchSensorData();
    setInterval(fetchSensorData, 5000); // Cập nhật mỗi 5 giây
});
