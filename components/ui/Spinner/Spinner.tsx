import s from './Spinner.module.css';

const Spinner = (props: {width: number}) => {
  var { width } = props;
  
  var defaultWidth = 4;
  var defaultBorder = 0.3;

  if(width){
    defaultWidth = width;
    defaultBorder = width * 0.15;
  }

  var style = {
    width: `${defaultWidth}em`,
    height: `${defaultWidth}em`,
    border: `${defaultBorder}em solid rgb(17 24 39)`,
    borderTop: `${defaultBorder}em solid #00b2ff`,
  }; 

  return <div className={s.root} style={style} />;
};

export default Spinner;

