export function generateId() {
  return crypto.randomUUID();
}

export function getInitialData() {
  const cat = (name, variations) => ({
    id: generateId(),
    name,
    variations: variations.map(([vName, stock]) => ({
      id: generateId(),
      name: vName,
      stock,
    })),
  });

  return {
    categories: [
      cat('Krep', [
        ['Çikolatalı', 24],
        ['Muzlu', 18],
        ['Çilekli', 15],
        ['Sade', 20],
      ]),
      cat('Waffle', [
        ['Belçika', 16],
        ['Nutella', 12],
        ['Meyveli', 10],
      ]),
      cat('Big Joy Bar', [
        ['Klasik', 30],
        ['Karamelli', 22],
        ['Bitter Çikolata', 18],
      ]),
      cat('İçecekler', [
        ['Espresso', 50],
        ['Latte', 40],
        ['Taze Portakal', 25],
        ['Soğuk Çay', 30],
      ]),
    ],
    sales: [],
    theme: 'light',
  };
}
