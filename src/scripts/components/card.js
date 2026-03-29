export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (data, userId, { onPreviewPicture, onLikeIcon, onDeleteCard }) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count"); 
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCounter.textContent = data.likes.length;

  //Проверяем, лайкали ли мы эту карточку ранее (есть ли наш ID в массиве)
  const isLikedByMe = data.likes.some((user) => user._id === userId);
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Логика удаления (только свои)
  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, likeCounter));

  cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};