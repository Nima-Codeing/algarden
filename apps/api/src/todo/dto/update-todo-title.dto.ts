import { PickType } from '@nestjs/mapped-types';

import { CreateTodoDto } from './create-todo.dto';

export class UpdateTodoTitleDto extends PickType(CreateTodoDto, [
  'title',
] as const) {}
