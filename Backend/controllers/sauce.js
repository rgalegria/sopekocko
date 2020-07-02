const fs = require("fs");
const Sauce = require("../models/sauce");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce Saved Successfully!" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() =>
      res.status(200).json({ message: "Sauce Modified Successfully!" })
    )
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() =>
            res.status(200).json({ message: "Sauce Deleted Successfully!" })
          )
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  // console.log(req.body);
  const likeCase = req.body.like;
  const user = req.body.userId;
  switch (likeCase) {
    case 1:
      // console.log("like added");
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: user } }
      )
        .then(() =>
          res.status(200).json({ message: "Sauce Liked Successfully!" })
        )
        .catch((error) => res.status(400).json({ error }));
      break;
    case 0:
      // console.log("like/dislike deleted");
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          let users = sauce.usersLiked;
          let inLikedArray = users.includes(user);
          // console.log(inLikedArray);
          if (inLikedArray === true) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: user } }
            )
              .then(() =>
                res.status(200).json({ message: "Sauce Liked Successfully!" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { dislikes: -1 }, $pull: { usersDisliked: user } }
            )
              .then(() =>
                res.status(200).json({ message: "Sauce Unliked Successfully!" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(500).json({ error }));
      break;
    case -1:
      // console.log("dislike added");
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: user } }
      )
        .then(() =>
          res.status(200).json({ message: "Sauce Disliked Successfully!" })
        )
        .catch((error) => res.status(400).json({ error }));
      break;
  }
};
