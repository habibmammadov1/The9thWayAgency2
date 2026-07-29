const fs = require('fs');

const addKeys = (filePath, additions) => {
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.BlogsPage = { ...data.BlogsPage, ...additions };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

addKeys('./src/i18n/messages/az.json', {
  searchLabel: 'Axtarış',
  searchPlaceholder: 'Axtarış edin...',
  topCategoriesLabel: 'Top Kateqoriyalar',
  recentPostsLabel: 'Son Məqalələr',
  allCategories: 'Bütün Kateqoriyalar'
});

addKeys('./src/i18n/messages/en.json', {
  searchLabel: 'Search',
  searchPlaceholder: 'Search here...',
  topCategoriesLabel: 'Top Categories',
  recentPostsLabel: 'Recent Posts',
  allCategories: 'All Categories'
});

addKeys('./src/i18n/messages/ru.json', {
  searchLabel: 'Поиск',
  searchPlaceholder: 'Искать здесь...',
  topCategoriesLabel: 'Популярные Категории',
  recentPostsLabel: 'Последние Посты',
  allCategories: 'Все Категории'
});

console.log("Translation keys added.");
