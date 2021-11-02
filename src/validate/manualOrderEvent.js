import * as yup from 'yup';

const lineItemSchema = yup.object().shape({
  productId: yup.string().min(19).required(),
  quantity: yup
    .number()
    .min(1)
    .required()
    .when('isBulkPurchase', { is: false, then: yup.number().max(1) }),
  isBulkPurchase: yup.boolean().required(),
});

const manualOrderSchema = yup.object().shape({
  id: yup
    .string()
    .required()
    .matches(/^thatev_.*/, { message: 'invalid THAT event id' }),
  eventId: yup.string().required().min(19),
  created: yup
    .string()
    .transform(epoch => epoch.toString())
    .required()
    .max(10),
  order: yup.object({
    createdBy: yup.string().required().min(9),
    event: yup.string().required().min(19),
    lineItems: yup.array().min(1).max(6).required().of(lineItemSchema),
    member: yup.string().required().min(9),
    orderDate: yup.string().min(24).required(),
    status: yup.string().strict().min(3).uppercase(),
  }),
  type: yup.string().required().min(5),
  livemode: yup.boolean().required(),
});

export default manualOrder =>
  manualOrderSchema
    .validate(manualOrder)
    .then(() => true)
    .catch(err => {
      throw err;
    });
