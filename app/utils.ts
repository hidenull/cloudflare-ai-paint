
export function DeleteImageLocalStorage(image_url:string){
    const storedItems = localStorage.getItem('imageItems');
    if (storedItems) {
      const imageItems = JSON.parse(storedItems);
      const updatedItems = imageItems.filter((item: any) => item.image_url !== image_url);
      localStorage.setItem('imageItems', JSON.stringify(updatedItems));
    }
}

export function InserImageLocalStorage(image_url:string,prompt:string){
    // Store the image_url in LocalStorage with expiration time of 7 days
    const expirationTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

    const storedItems = localStorage.getItem('imageItems');
    const imageItems = storedItems ? JSON.parse(storedItems) : [];

    imageItems.push({ image_url, expirationTime, prompt });

    localStorage.setItem('imageItems', JSON.stringify(imageItems));
}