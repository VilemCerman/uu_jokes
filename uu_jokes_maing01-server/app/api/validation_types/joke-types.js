/* eslint-disable */

const jokeCreateDtoInType = shape({
  name: string(3, 255).isRequired(),
  text: string(3, 4000).isRequired(),
  categoryName: string(2, 255)
});

const jokeGetDtoInType = shape({
  id: id().isRequired()
})

const jokeListDtoInType = shape({
  sortBy: oneOf(["name", "category"]),
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
  categoryName: uu5String(255)
})
