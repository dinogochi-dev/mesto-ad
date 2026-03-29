import { initialCards } from "./cards.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const deleteCardModalWindow = document.querySelector(".popup_type_remove-card");
const deleteCardForm = deleteCardModalWindow.querySelector(".popup__form");

const infoPopup = document.querySelector('.popup_type_info');
const infoPopupTitle = infoPopup.querySelector('.popup__title');
const infoPopupDescriptionList = infoPopup.querySelector('.popup__info');
const infoPopupText = infoPopup.querySelector('.popup__text');
const infoPopupList = infoPopup.querySelector('.popup__list');

const logo = document.querySelector('.header__logo');

const definitionTemplate = document.querySelector('#popup-info-definition-template').content;
const userPreviewTemplate = document.querySelector('#popup-info-user-preview-template').content;

const CURRENT_USER_ID = 'current-user';
let cardToDelete = null;
let cardsState = [];

const getCardById = (cardId) => cardsState.find((card) => card._id === cardId);

const  normalizeCard = (card) => ({
  ...card,
  _id: card._id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  owner: card.owner || { _id: CURRENT_USER_ID, name: profileTitle.textContent || 'Пользователь' },
  likes: Array.isArray(card.likes) ? card.likes : [],
});

const handleLogoClick = () => {
  infoPopupDescriptionList.innerHTML = '';
  infoPopupList.innerHTML = '';

  const userStats = cardsState.reduce((acc, card) => {
    const authorName = card.owner.name;
    acc[authorName] = (acc[authorName] || 0) + card.likes.length;
    return acc;
  }, {});

  const totalUsers = Object.keys(userStats).length;
  const totalLikes = cardsState.reduce((acc, card) => acc + card.likes.length, 0);

  let maxLikesFromOne = 0;
  let championName = "Нет данных";

  Object.entries(userStats).forEach(([name, likes]) => {
    if (likes > maxLikesFromOne) {
      maxLikesFromOne = likes;
      championName = name;
    }
  });

  const popularCards = [...cardsState]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 3);

  infoPopupTitle.textContent = 'Статистика карточек';
  infoPopupText.textContent = 'Популярные карточки:';

  const statsData = [
    { term: 'Всего пользователей:', desc: totalUsers },
    { term: 'Всего лайков:', desc: totalLikes },
    { term: 'Максимально лайков от одного:', desc: maxLikesFromOne },
    { term: 'Чемпион лайков:', desc: championName }
  ];

  statsData.forEach(item => {
    const statElement = definitionTemplate.querySelector('.popup__info-item').cloneNode(true);
    statElement.querySelector('.popup__info-term').textContent = item.term;
    statElement.querySelector('.popup__info-description').textContent = item.desc;
    infoPopupDescriptionList.append(statElement);
  });

  popularCards.forEach(card => {
    const badgeElement = userPreviewTemplate.querySelector('.popup__list-item').cloneNode(true);
    badgeElement.textContent = card.name;
    infoPopupList.append(badgeElement);
  });

  openModalWindow(infoPopup);
};

logo.style.cursor = 'pointer';
logo.addEventListener('click', handleLogoClick);

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeClick = (likeButton, cardId, likeCounter) => {
  const card = getCardById(cardId);
  const hasLiked = likeButton.classList.contains('card__like-button_is-active');

  if (hasLiked) {
    likeButton.classList.remove('card__like-button_is-active');
    card.likes = card.likes.filter((user) => user._id !== CURRENT_USER_ID);
  } else {
    likeButton.classList.add('card__like-button_is-active');
    card.likes.push({ _id: CURRENT_USER_ID });
  }

  likeCounter.textContent = card.likes.length;
};

const renderCard = (data, method = 'append') => {
  const normalized = normalizeCard(data);
  const cardElement = createCardElement(normalized, CURRENT_USER_ID, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeClick,
    onDeleteCard: (element, cardId) => {
      cardToDelete = { element, cardId };
      openModalWindow(deleteCardModalWindow);
    },
  });

  cardsState = [...cardsState.filter((card) => card._id !== normalized._id), normalized];

  if (method === 'prepend') {
    placesWrap.prepend(cardElement);
  } else {
    placesWrap.append(cardElement);
  }
};

openProfileFormButton.addEventListener('click', () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

const closeButtons = document.querySelectorAll('.popup');
closeButtons.forEach((popup) => setCloseModalWindowEventListeners(popup));

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';

  profileTitle.textContent = profileTitleInput.value;
  profileDescription.textContent = profileDescriptionInput.value;
  closeModalWindow(profileFormModalWindow);

  submitButton.textContent = initialText;
};

profileForm.addEventListener('submit', handleProfileFormSubmit);

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';

  profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
  avatarForm.reset();
  closeModalWindow(avatarFormModalWindow);

  submitButton.textContent = initialText;
};

avatarForm.addEventListener('submit', handleAvatarFromSubmit);

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  submitButton.textContent = 'Создание...';

  const cardData = {
    name: cardNameInput.value,
    link: cardLinkInput.value,
    owner: { _id: CURRENT_USER_ID, name: profileTitle.textContent },
    likes: [],
  };

  renderCard(cardData, 'prepend');
  cardForm.reset();
  closeModalWindow(cardFormModalWindow);

  submitButton.textContent = initialText;
};

cardForm.addEventListener('submit', handleCardFormSubmit);

deleteCardForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  if (cardToDelete) {
    cardToDelete.element.remove();
    cardsState = cardsState.filter((card) => card._id !== cardToDelete.cardId);
    cardToDelete = null;
  }

  closeModalWindow(deleteCardModalWindow);
});

const init = () => {
  const initialData = initialCards.map((card) => ({
    ...card,
    owner: { _id: CURRENT_USER_ID, name: profileTitle.textContent },
    likes: [],
  }));

  cardsState = [];

  initialData.forEach((cardData) => renderCard(cardData));

  profileAvatar.style.backgroundImage = 'url(./src/images/avatar.jpg)';
};

init();

enableValidation(validationConfig);