import { changeLikeCardStatus } from './api.js';

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

const updateLikeCount = (likeCounter, likes) => {
  likeCounter.textContent = likes.length;
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export const likeCard = (likeButton, cardId, likeCounter, userId) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle('card__like-button_is-active');
      updateLikeCount(likeCounter, updatedCard.likes);
    })
    .catch((err) => {
      console.error(err);
    });
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  userId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count"); 
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  updateLikeCount(likeCounter, data.likes);

  if (isCardLiked(data.likes, userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  if (onLikeIcon) {
    likeButton.addEventListener('click', () =>
      onLikeIcon(likeButton, data._id, likeCounter, userId)
    );
  }

  if (onDeleteCard) {
    if (data.owner._id === userId) {
      deleteButton.addEventListener('click', () => onDeleteCard(cardElement, data._id));
    } else {
      deleteButton.remove();
    }
  }

  if (onPreviewPicture) {
    cardImage.addEventListener('click', () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
