import * as yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = yup.object()
      .shape({
        name: yup.string()
          .required(),
        email: yup.string()
          .required(),
        passowrd: yup.string()
          .required()
          .min(6),
      });

    if (!(await schema.isValid(req.body))) {
      return res.status(400)
        .json({
          error: 'Validation failure',
        });
    }

    const userExists = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (userExists) {
      return res.status(400)
        .json({
          error: 'Usuario já cadastrado',
        });
    }
    const {
      id,
      name,
      email,
      provider,
    } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = yup.object()
      .shape({
        name: yup.string(),
        email: yup.string(),
        oldPassword: yup.string()
          .min(6),
        passowd: yup.string()
          .min(6)
          .when('oldPassword', (oldPassword, field) => (oldPassword ? field.required()
            : field)),
        confirmPassword: yup.string()
          .when('password', (password, field) => (password ? field.required()
            .oneOf([yup.ref('passowd')]) : field)),
      });

    if (!(await schema.isValid(req.body))) {
      return res.status(400)
        .json({
          error: 'Validation failure',
        });
    }

    const {
      email,
      oldPassword,
    } = req.body;

    const user = await User.findByPk(req.userId);
    console.log('\n\n\n\n email ', user);
    if (email !== user.email) {
      const userExists = await User.findOne({
        where: {
          email,
        },
      });
      if (userExists) {
        return res.status(400)
          .json({
            error: 'Usuario já cadastrado',
          });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401)
        .json({
          error: 'Password does not match',
        });
    }

    const {
      id,
      name,
      provider,
    } = user.update(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
