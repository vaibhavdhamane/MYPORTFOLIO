const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('#theme-toggle');

menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    menuToggle.innerHTML = `<i class="fas ${isOpen ? 'fa-xmark' : 'fa-bars'}"></i>`;
});

navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.body.dataset.theme = 'dark';
if (savedTheme === 'light') delete document.body.dataset.theme;

function updateThemeControl() {
    const isDark = document.body.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeToggle.innerHTML = `<i class="far ${isDark ? 'fa-sun' : 'fa-moon'}"></i>`;
}

updateThemeControl();
themeToggle.addEventListener('click', () => {
    const isDark = document.body.dataset.theme !== 'dark';
    document.body.dataset.theme = isDark ? 'dark' : 'light';
    if (!isDark) delete document.body.dataset.theme;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeControl();
});

const githubUsername = 'vaibhavdhamane';
const contributionChart = document.querySelector('#contribution-chart');
const contributionMonths = document.querySelector('#contribution-months');
const contributionTotal = document.querySelector('#contribution-total');
const contributionStatus = document.querySelector('#contribution-status');

function renderContributionCalendar(contributions, totals) {
    const validDays = contributions
        .map((day) => ({ ...day, parsedDate: new Date(`${day.date}T00:00:00Z`) }))
        .filter((day) => !Number.isNaN(day.parsedDate.getTime()))
        .sort((first, second) => first.parsedDate - second.parsedDate);

    if (!validDays.length) throw new Error('No contribution days returned.');

    const firstDate = validDays[0].parsedDate;
    const lastDate = validDays[validDays.length - 1].parsedDate;
    const calendarStart = new Date(firstDate);
    calendarStart.setUTCDate(calendarStart.getUTCDate() - calendarStart.getUTCDay());
    const calendarEnd = new Date(lastDate);
    calendarEnd.setUTCDate(calendarEnd.getUTCDate() + (6 - calendarEnd.getUTCDay()));
    const numberOfWeeks = Math.ceil((calendarEnd - calendarStart + 86400000) / (7 * 86400000));
    const daysByDate = new Map(validDays.map((day) => [day.date, day]));

    contributionChart.replaceChildren();
    contributionChart.style.gridTemplateColumns = `repeat(${numberOfWeeks}, 11px)`;
    contributionMonths.replaceChildren();
    contributionMonths.style.gridTemplateColumns = `repeat(${numberOfWeeks}, 11px)`;
    contributionMonths.style.columnGap = '3px';

    const placedMonths = new Set();
    let total = Number(totals?.lastYear);

    for (let week = 0; week < numberOfWeeks; week += 1) {
        for (let weekday = 0; weekday < 7; weekday += 1) {
            const date = new Date(calendarStart);
            date.setUTCDate(calendarStart.getUTCDate() + week * 7 + weekday);
            const dateKey = date.toISOString().slice(0, 10);
            const day = daysByDate.get(dateKey);
            const cell = document.createElement('span');
            cell.className = 'contribution-day';
            cell.dataset.level = String(day?.level ?? 0);
            cell.title = `${day?.count ?? 0} contributions on ${date.toLocaleDateString(undefined, { timeZone: 'UTC', dateStyle: 'medium' })}`;
            if (date < firstDate || date > lastDate) cell.setAttribute('aria-hidden', 'true');
            contributionChart.append(cell);

            const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
            if (date.getUTCDate() <= 7 && !placedMonths.has(monthKey) && date >= firstDate && date <= lastDate) {
                placedMonths.add(monthKey);
                const month = document.createElement('span');
                month.textContent = date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
                month.style.gridColumnStart = String(week + 1);
                contributionMonths.append(month);
            }
        }
    }

    if (!Number.isFinite(total)) total = validDays.reduce((sum, day) => sum + (Number(day.count) || 0), 0);
    contributionTotal.textContent = `${total.toLocaleString()} contributions`;
    contributionChart.setAttribute('aria-label', `${total.toLocaleString()} GitHub contributions in the last 12 months`);
    contributionStatus.textContent = 'Daily activity from your public GitHub profile';
}

fetch(`https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`)
    .then((response) => {
        if (!response.ok) throw new Error(`Contribution service returned ${response.status}.`);
        return response.json();
    })
    .then((data) => renderContributionCalendar(data.contributions, data.total))
    .catch(() => {
        contributionTotal.textContent = 'Contribution activity unavailable';
        contributionChart.setAttribute('aria-label', 'Contribution graph unavailable');
        contributionStatus.innerHTML = `<a href="https://github.com/${githubUsername}" target="_blank" rel="noreferrer">See your activity on GitHub</a>`;
    });
