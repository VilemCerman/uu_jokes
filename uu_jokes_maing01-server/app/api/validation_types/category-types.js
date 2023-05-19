/* eslint-disable */

const categoryCreateDtoInType = shape({
  name: string(2, 255).isRequired()
});

const categoryGetDtoInType = shape({
  id: id().isRequired()
})

const categoryListDtoInType = shape({
  sortBy: oneOf(["name"]),
  order: oneOf(["asc", "desc"]),
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
})

const categoryDeleteDtoInType = shape({
  id: id().isRequired()
});

const categoryUpdateDtoInType = shape({
  id: id().isRequired(),
  name: uu5String(255)
})
