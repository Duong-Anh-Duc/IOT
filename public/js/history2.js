document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filterForm');
    const sortFieldSelect = document.getElementById('sortField');
    const sortOrderSelect = document.getElementById('sortOrder');
    const sortOrderLabel = document.querySelector('label[for="sortOrder"]');

    sortOrderSelect.style.display = 'none';
    sortOrderLabel.style.display = 'none';

    sortFieldSelect.addEventListener('change', function () {
        if (sortFieldSelect.value !== 'none') {
            sortOrderSelect.style.display = 'block';
            sortOrderLabel.style.display = 'block';
        } else {
            sortOrderSelect.style.display = 'none';
            sortOrderLabel.style.display = 'none';
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = urlParams.get('page') || 1;

    loadData(initialPage, false);

    filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loadData(1, true);
    });
});

const loadData = async (page = 1, shouldUpdateUrl = true) => {
    const filterForm = document.getElementById('filterForm');
    const weatherTableBody = document.getElementById('weatherTable').getElementsByTagName('tbody')[0];

    const formData = new FormData(filterForm);
    formData.append('page', page);
    const params = new URLSearchParams(formData).toString();

    try {
        const response = await axios.get(`/api/weatherData?${params}`);
        const { records, currentPage, totalPages, limit } = response.data;

        if (shouldUpdateUrl) {
            const newUrl = `${window.location.pathname}?${params}`;
            history.pushState(null, '', newUrl);
        }

        weatherTableBody.innerHTML = '';

        records.forEach((record, index) => {
            const row = document.createElement('tr');
            const stt = (currentPage - 1) * limit + index + 1;
            row.innerHTML = `
                <td>${stt}</td>
                <td>${record.temperature}°C</td>
                <td>${record.humidity}%</td>
                <td>${record.light} lux</td>
                <td>${record.day} ${record.hour}</td>
            `;
            weatherTableBody.appendChild(row);
        });

        updatePagination(currentPage, totalPages, limit);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};
const updatePagination = (currentPage, totalPages, limit) => {
    const paginationWrapper = document.querySelector('.pagination');

    if (!paginationWrapper) {
        console.error('Không tìm thấy phần tử phân trang (.pagination)');
        return;
    }

    paginationWrapper.innerHTML = '';

    if (totalPages <= 1) return;
    if (currentPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.classList.add('page-item');
        firstLi.innerHTML = `<a class="page-link" href="#">«</a>`;
        firstLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(1); 
        });
        paginationWrapper.appendChild(firstLi);
    }

    if (currentPage > 1) {
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        prevLi.innerHTML = `<a class="page-link" href="#">Trang Trước</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(currentPage - 1); 
        });
        paginationWrapper.appendChild(prevLi);
    }
    const paginationRange = getPaginationRange(currentPage, totalPages);
    paginationRange.forEach(page => {
        const li = document.createElement('li');
        li.classList.add('page-item');

        if (page === '...') {
            li.classList.add('disabled');
            li.innerHTML = `<span class="page-link">...</span>`;
        } else {
            if (page === currentPage) {
                li.classList.add('active');
                li.innerHTML = `<span class="page-link">${page}</span>`;
            } else {
                li.innerHTML = `<a class="page-link" href="#">${page}</a>`;
                li.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    loadData(page); 
                });
            }
        }

        paginationWrapper.appendChild(li);
    });
    if (currentPage < totalPages) {
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        nextLi.innerHTML = `<a class="page-link" href="#">Trang Sau</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(currentPage + 1);
        });
        paginationWrapper.appendChild(nextLi);
    }

    if (currentPage < totalPages) {
        const lastLi = document.createElement('li');
        lastLi.classList.add('page-item');
        lastLi.innerHTML = `<a class="page-link" href="#">»</a>`;
        lastLi.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadData(totalPages);
        });
        paginationWrapper.appendChild(lastLi);
    }
};
const getPaginationRange = (currentPage, totalPages, delta = 2) => {
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }
    range.forEach(i => {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    });

    return rangeWithDots;
};