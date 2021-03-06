"use strict";

// Middleware Imports

const fs = require("fs");
const Sauce = require("../models/sauce");

// POST Create Sauce Controller

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce Saved Successfully!" }))
    .catch((error) => res.status(400).json({ error }));
};

// GET all Sacuces Controller

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// GET one Sacuce Controller

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// PUT Modify Sacuce Controller

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

// DELETE Sacuce Controller

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

// POST Like/Dislike Sacuces Controller

exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
    case 1: // Like Sauce
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId },
          _id: req.params.id,
        }
      )
        .then(() =>
          res.status(201).json({ message: "Sauce Liked Successfully!" })
        )
        .catch((error) => res.status(400).json({ error }));
      break;
    case -1: // Dislike Sauce
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId },
          _id: req.params.id,
        }
      )
        .then(() =>
          res.status(201).json({ message: "Sauce Disliked Successfully!" })
        )
        .catch((error) => res.status(400).json({ error }));
      break;
    case 0: // Like ou Dislike Sauce
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.includes(req.body.userId) === true) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
            )
              .then(() =>
                res.status(200).json({ message: "Sauce UnLiked Successfully!" })
              )
              .catch((error) => res.status(400).json({ error }));
          } else {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() =>
                res
                  .status(200)
                  .json({ message: "Sauce Undisliked Successfully!" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(500).json({ error }));
      break;
  }
};
