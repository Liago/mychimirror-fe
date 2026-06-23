type Props = {
	user: string;
	review: string;
	rating: number;
};
const BookReview = ({ user, review, rating }: Props) => {
	return (
		<>
			<p>{user}</p>
			<p>{review}</p>
			<p>{rating}</p>
		</>
	);
};

export default BookReview;
