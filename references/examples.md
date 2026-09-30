# DomainText Examples

## University

```txt
Person(id, name, email?)
Student(student_number, enrollments: Enrollment[]!) < Person
Instructor(employee_number) < Person
Course(id, code, title, instructor: Instructor)
Enrollment(id, course: Course, enrolled_at, grade?)
```

Meaning:

- `Student` and `Instructor` inherit from `Person`.
- `Student` owns many `Enrollment` records.
- `Course` references one `Instructor`.
- `Enrollment` references one `Course`.

## Identity

```txt
Person(id, first_name, last_name, email?)
User(email, password_hash, person: Person?)
Team(id, name, owner: Person, members: Person[])
```

Meaning:

- `User` optionally references `Person`.
- `Team` references one owner and many members.

## Composite Pattern

```txt
Party(id)
Person(first_name, last_name) < Party
Organization(name, children: Party[]!) < Party
Team(owner: Person) < Organization
```

Meaning:

- `Party` is the root.
- `Person` is a leaf.
- `Organization` is a composite because it owns `Party[]` children.
- `Team` is a specialized `Organization`.

## Orders

```txt
Customer(id, name, email?)
Order(id, number, customer: Customer, lines: OrderLine[]!)
OrderLine(product: Product, quantity, price)
Product(id, sku, name, price)
```

Meaning:

- `Order` references `Customer`.
- `Order` owns `OrderLine[]`.
- `OrderLine` references `Product`.

## External Scalar Types

```txt
Invoice(id: UUID, amount: Money, issued_at: DateTime)
```

Meaning:

- `UUID`, `Money`, and `DateTime` are external scalar types unless separately declared as entities.
