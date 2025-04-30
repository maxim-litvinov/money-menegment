let records = []

const tabs = document.querySelectorAll('.menu-link')
const tabContents = document.querySelectorAll('.tab-content')
const modal = document.getElementById('modal')
const closeButton = document.querySelector('.close-button')
const addButton = document.querySelector('.btn-add')
const recordForm = document.getElementById('record-form')
const recordsTableBody = document.querySelectorAll('.records-table tbody')
const filterCategory = document.querySelector('.filter-category')
const burgerMenu = document.querySelector('.burger-menu')
const navList = document.querySelector('.nav-list')

// Переключение табов
tabs.forEach(tab => {
	tab.addEventListener('click', () => {
		tabs.forEach(t => t.classList.remove('active'))
		tab.classList.add('active')

		tabContents.forEach(content => content.classList.remove('active'))

		const targetTab = tab.getAttribute('data-tab')
		document.getElementById(targetTab).classList.add('active')
	})
})

//Модальное окно
addButton.addEventListener('click', () => {
	modal.classList.add('active')
})
closeButton.addEventListener('click', () => {
	modal.classList.remove('active')
})
window.addEventListener('click', (e) => {
	if (e.target === modal) {
		modal.classList.remove('active')
	}
})


function updateTable() {
	const filterValue = filterCategory.value
	const activeTab = document.querySelector('.menu-link.active').getAttribute('data-tab')

	//Фильтрация
	let filteredRecords = records.filter(record => {
		let matchCategory = filterValue === 'all' || record.category === filterValue

		if (activeTab === 'content-income') return matchCategory && record.type === 'Доход'
		if (activeTab === 'content-expenses') return matchCategory && record.type === 'Расход'
		return matchCategory
	})

	//Очистка таблиц
	recordsTableBody.forEach(tbody => tbody.innerHTML = '')

	//Заполнение таблиц
	recordsTableBody.forEach(tbody => {
		const tabId = tbody.closest('.tab-content').id

		filteredRecords.forEach(record => {
			if (tabId === 'content-income' && record.type !== 'Доход') return
			if (tabId === 'content-expenses' && record.type !== 'Расход') return

			const row = document.createElement('tr')
			row.innerHTML = `
        <td>${record.amount}</td>
        <td>${record.category}</td>
        <td>${record.date}</td>
        <td>
          <button onclick="editRecord(${record.id})">Изменить</button>
          <button onclick="deleteRecord(${record.id})">Удалить</button>
        </td>
      `
			tbody.appendChild(row)
			modal.classList.remove('active')
		})
	})
}

//Удаление записи
function deleteRecord(id) {
	records = records.filter(record => record.id !==id)
	updateTable()
	
}

//Редактирование записи
let editingId = null

function editRecord(id) {
	const record = records.find(r => r.id === id)
	if (!record) return

	//Заполнение
	document.querySelector(`input[value="${record.type}"]`).checked = true
	document.getElementById('amount').value = record.amount
	document.getElementById('category').value = record.category
	document.getElementById('date').value = record.date
	document.getElementById('description').value = record.description

	editingId = id
	modal.classList.add('active')
	updateChart()
}

recordForm.addEventListener('submit', (e) => {
	e.preventDefault()

	const type = document.querySelector('input[name="choice"]:checked').value
	const amount = document.getElementById('amount').value
	const category = document.getElementById('category').value
	const date = document.getElementById('date').value
	const description = document.getElementById('description').value

	const recordData = {
		type,
		amount,
		category,
		date,
		description,
	}

	if (editingId) {
		//Редактирование существующей записи
		const index = records.findIndex(r => r.id  === editingId)
		records[index] = { ...records[index], ...recordData }
		editingId = null 
	} else {
		//Добавление новой записи
		records.push({
			id: Date.now(),
			...recordData
		})
	} 

	updateTable()
	modal.classList.remove('active')
	recordForm.reset()
	updateChart()
})


//Аналитика
const analyticsContainer = document.querySelector('.analytics-container')
const ctx = document.createElement('canvas')
analyticsContainer.appendChild(ctx)

const chart = new Chart (ctx, {
	type: 'bar',
	data: {
		labels: ['Доходы', 'Расходы'],
		datasets: [{
			label: 'Сумма',
			data: [0, 0],
			backgroundColor: ['#4caf50', '#f44336'],
		}],
	},
	options: {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	},
})

function updateChart() {
	const totalIncome = records.filter(record => record.type === 'Доход').reduce((sum, record) => sum + parseFloat(record.amount), 0)
	const totalExpenses = records.filter(record => record.type === 'Расход').reduce((sum, record) => sum + parseFloat(record.amount), 0)
	
	chart.data.datasets[0].data = [totalIncome, totalExpenses]
	chart.update()
}

