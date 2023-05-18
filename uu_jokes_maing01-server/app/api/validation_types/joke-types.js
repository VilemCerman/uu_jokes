/* eslint-disable */

const jokeCreateDtoInType = shape({
  name: string(3, 255).isRequired(),
  text: string(3, 4000).isRequired()
});

const jokeGetDtoInType = shape({
  id: id().isRequired()
})

const jokeListDtoInType = shape({
  sortBy: oneOf(["name", "rating"]),
  order: oneOf(["asc", "desc"]),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
})

const jokeDeleteDtoInType = shape({
  id: id().isRequired()
});

const jokeUpdateDtoInType = shape({
  id: id().isRequired(),
  name: uu5String(255),
  text: uu5String(4000),
  categoryIdList: array(id(), 10),
  image: binary()
})

const jokeGetImageDataDtoInType = shape ({
  image: code().isRequired(),
  contentDisposition: oneOf(["inline", "attachment"])
});
